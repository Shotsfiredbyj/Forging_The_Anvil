"""RunPod serverless benchmark — CLI entry point.

Usage:
    python -m runpod_bench setup [--keys KEY1,KEY2]   Deploy fleet to RunPod
    python -m runpod_bench status                      Check fleet health + billing
    python -m runpod_bench run --phase A|B|C           Run benchmark phase
    python -m runpod_bench compare [--all]             Analyse results
    python -m runpod_bench teardown                    Destroy all endpoints + templates
    python -m runpod_bench gpu-check                   List available GPUs + pricing

Requires RUNPOD_API_KEY env var. Fleet state is persisted to
results/fleet_state.json between commands.
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path

# Ensure package imports work when run as __main__
sys.path.insert(0, str(Path(__file__).resolve().parent))

import config as cfg
import infra
import manifest
from compare import main as compare_main
from harness import main as harness_main

log = logging.getLogger("runpod_bench")

FLEET_STATE_PATH = Path(__file__).resolve().parent / "results" / "fleet_state.json"


def _api_key() -> str:
    key = os.environ.get("RUNPOD_API_KEY", "")
    if not key:
        print("Error: RUNPOD_API_KEY environment variable not set.")
        sys.exit(1)
    return key


def _ensure_results_dir():
    FLEET_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_setup(args):
    """Deploy fleet to RunPod."""
    api_key = _api_key()
    _ensure_results_dir()

    # Select models to deploy
    keys = args.keys.split(",") if args.keys else None
    deployments = manifest.get_fleet(keys)

    if not deployments:
        print("No models matched. Available keys:")
        for m in manifest.FLEET:
            print(f"  {m.key:<30} {m.name}")
        sys.exit(1)

    print(f"\nDeploying {len(deployments)} endpoints:\n")
    for dep in deployments:
        print(f"  {dep.key:<30} {dep.hf_model_id:<50} {dep.gpu_id}")

    if not args.yes:
        confirm = input("\nProceed? [y/N] ").strip().lower()
        if confirm != "y":
            print("Aborted.")
            return

    fleet = infra.deploy_fleet(deployments, api_key)
    fleet.save(str(FLEET_STATE_PATH))

    print(f"\nDeployed {len(fleet.endpoints)} endpoints.")
    print(f"Fleet state saved to {FLEET_STATE_PATH}")

    # Print endpoint IDs for reference
    print("\nEndpoint IDs:")
    for key, dep in fleet.endpoints.items():
        print(f"  {key}: {dep.endpoint_id}")

    # Export as env vars for the harness
    env_path = FLEET_STATE_PATH.parent / "fleet_env.sh"
    with open(env_path, "w") as f:
        f.write("# Source this file to set endpoint env vars for the harness\n")
        f.write(f"export RUNPOD_API_KEY='{api_key}'\n")
        for key, dep in fleet.endpoints.items():
            env_name = f"RUNPOD_ENDPOINT_{key.upper()}"
            f.write(f"export {env_name}='{dep.endpoint_id}'\n")
    print(f"\nEnv vars written to {env_path}")
    print(f"Run: source {env_path}")


def cmd_status(args):
    """Check fleet health and billing."""
    api_key = _api_key()

    if not FLEET_STATE_PATH.exists():
        print("No fleet state found. Run 'setup' first.")
        sys.exit(1)

    fleet = infra.Fleet.load(str(FLEET_STATE_PATH))
    statuses = infra.fleet_status(fleet, api_key)

    print(f"\nFleet status ({len(fleet.endpoints)} endpoints):\n")
    print(f"  {'Key':<30} {'Endpoint':<20} {'Status'}")
    print(f"  {'-'*30} {'-'*20} {'-'*30}")

    for key, health in statuses.items():
        endpoint_id = fleet.endpoints[key].endpoint_id
        if "error" in health:
            status_str = f"ERROR: {health['error']}"
        else:
            workers = health.get("workers", {})
            jobs = health.get("jobs", {})
            status_str = (
                f"workers: {workers.get('ready', 0)} ready, "
                f"{workers.get('idle', 0)} idle, "
                f"{workers.get('running', 0)} running | "
                f"jobs: {jobs.get('completed', 0)} done, "
                f"{jobs.get('inProgress', 0)} running, "
                f"{jobs.get('inQueue', 0)} queued"
            )
        print(f"  {key:<30} {endpoint_id:<20} {status_str}")

    # Billing
    billing = infra.get_billing(api_key)
    myself = billing.get("myself", {})
    spend = myself.get("currentSpendPerHr", 0)
    print(f"\nCurrent spend: ${spend:.4f}/hr")


def cmd_run(args):
    """Run a benchmark phase. Loads fleet state and sets env vars."""
    api_key = _api_key()

    if FLEET_STATE_PATH.exists():
        fleet = infra.Fleet.load(str(FLEET_STATE_PATH))
        # Set env vars so the harness can find endpoints
        for key, dep in fleet.endpoints.items():
            env_name = f"RUNPOD_ENDPOINT_{key.upper()}"
            os.environ[env_name] = dep.endpoint_id

    # Delegate to harness
    sys.argv = ["harness", "--phase", args.phase]
    if args.verbose:
        sys.argv.append("--verbose")
    if args.phase_b_results:
        sys.argv.extend(["--phase-b-results", args.phase_b_results])

    harness_main()


def cmd_compare(args):
    """Analyse benchmark results."""
    sys.argv = ["compare"]
    if args.all:
        sys.argv.append("--all")
    if args.files:
        sys.argv.extend(args.files)

    compare_main()


def cmd_teardown(args):
    """Destroy all endpoints and templates."""
    api_key = _api_key()

    if not FLEET_STATE_PATH.exists():
        print("No fleet state found. Nothing to tear down.")
        return

    fleet = infra.Fleet.load(str(FLEET_STATE_PATH))

    print(f"\nTearing down {len(fleet.endpoints)} endpoints:\n")
    for key, dep in fleet.endpoints.items():
        print(f"  {key}: endpoint={dep.endpoint_id} template={dep.template_id}")

    if not args.yes:
        confirm = input("\nProceed? [y/N] ").strip().lower()
        if confirm != "y":
            print("Aborted.")
            return

    infra.teardown_fleet(fleet, api_key, manifest.FLEET)
    FLEET_STATE_PATH.unlink(missing_ok=True)

    # Clean up env file
    env_path = FLEET_STATE_PATH.parent / "fleet_env.sh"
    env_path.unlink(missing_ok=True)

    print("\nFleet torn down. State files cleaned up.")


def cmd_gpu_check(args):
    """List available GPUs on RunPod."""
    api_key = _api_key()
    gpus = infra.get_gpu_availability(api_key)

    print(f"\nAvailable GPUs ({len(gpus)}):\n")
    print(f"  {'ID':<25} {'Name':<30} {'VRAM (GB)':>10}")
    print(f"  {'-'*25} {'-'*30} {'-'*10}")

    for gpu in sorted(gpus, key=lambda g: g.get("memoryInGb", 0)):
        print(f"  {gpu['id']:<25} {gpu['displayName']:<30} "
              f"{gpu.get('memoryInGb', '?'):>10}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="RunPod serverless benchmark",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--verbose", "-v", action="store_true")
    sub = parser.add_subparsers(dest="command")

    # setup
    p_setup = sub.add_parser("setup", help="Deploy fleet to RunPod")
    p_setup.add_argument("--keys", type=str, default=None,
                         help="Comma-separated model keys to deploy (default: all)")
    p_setup.add_argument("--yes", "-y", action="store_true",
                         help="Skip confirmation prompt")

    # status
    sub.add_parser("status", help="Check fleet health and billing")

    # run
    p_run = sub.add_parser("run", help="Run benchmark phase")
    p_run.add_argument("--phase", choices=["A", "B", "C"], required=True)
    p_run.add_argument("--phase-b-results", type=str, default=None)
    p_run.add_argument("--verbose", "-v", action="store_true")

    # compare
    p_compare = sub.add_parser("compare", help="Analyse benchmark results")
    p_compare.add_argument("--all", action="store_true")
    p_compare.add_argument("files", nargs="*")

    # teardown
    p_teardown = sub.add_parser("teardown", help="Destroy all endpoints")
    p_teardown.add_argument("--yes", "-y", action="store_true",
                            help="Skip confirmation prompt")

    # gpu-check
    sub.add_parser("gpu-check", help="List available GPUs")

    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
    )

    if not args.command:
        parser.print_help()
        sys.exit(1)

    commands = {
        "setup": cmd_setup,
        "status": cmd_status,
        "run": cmd_run,
        "compare": cmd_compare,
        "teardown": cmd_teardown,
        "gpu-check": cmd_gpu_check,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
