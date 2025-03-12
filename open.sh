#!/bin/bash

# Get the current repository URL from the git config
REPO_URL=$(git config --get remote.origin.url)

# Check if the repository URL was found
if [ -z "$REPO_URL" ]; then
  echo "No remote repository URL found."
  exit 1
fi

# Convert the repository URL to the browser-friendly format
BROWSER_URL=${REPO_URL/git@github.com:/https:\/\/github.com\/}
BROWSER_URL=${BROWSER_URL/.git/}

# Open the repository URL in the default web browser
if which xdg-open > /dev/null; then
  xdg-open "$BROWSER_URL"
elif which open > /dev/null; then
  open "$BROWSER_URL"
else
  echo "Could not detect the web browser to use."
  exit 1
fi
