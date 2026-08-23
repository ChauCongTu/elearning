#!/bin/bash
# Wrapper — canonical script lives at /deploy/elearning.sh on EC2.
exec bash /deploy/elearning.sh "$@"
