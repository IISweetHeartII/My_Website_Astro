#!/bin/sh
set -e

EVENT="${1:-}"

case "$EVENT" in
  TeammateIdle)
    bun run lint
    ;;
  TaskCompleted)
    bun run lint
    bun run type-check
    ;;
  *)
    bun run lint
    ;;
esac
