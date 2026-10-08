import os
import sys
import json
import ssl
import subprocess
import random
import argparse
import urllib.request
from datetime import datetime, timedelta, time

USERNAME = "kaku-coder"
TARGET_DIR = r"d:\kaku_coder_sequential"
START_DATE = datetime(2026, 1, 1).date()
MIN_COMMITS_PER_DAY = 1
MAX_COMMITS_PER_DAY = 30
DAYS_PER_REPO = 10

ssl_context = ssl._create_unverified_context()

def parse_args():
    parser = argparse.ArgumentParser(description="Sequential multi-repo backdated commit automation.")
    parser.add_argument("--push", action="store_true", help="Push to origin remote after completing each repo")
    parser.add_argument("--dry-run", action="store_true", help="Simulate schedule without executing git commands")
    parser.add_argument("--max-repos", type=int, default=100, help="Maximum repos to process")
    return parser.parse_args()

def get_all_user_repos(username):
    all_repos = []
    page = 1
    while True:
        url = f"https://api.github.com/users/{username}/repos?per_page=100&page={page}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        try:
            with urllib.request.urlopen(req, context=ssl_context) as response:
                data = json.loads(response.read().decode('utf-8'))
                if not data:
                    break
                all_repos.extend(data)
                if len(data) < 100:
                    break
                page += 1
        except Exception as e:
            print(f"[API ERROR] Page {page}: {e}")
            break
    return all_repos

def ensure_repo_cloned(repo_info, target_dir, dry_run=False):
    repo_name = repo_info['name']
    clone_url = repo_info['clone_url']
    repo_path = os.path.join(target_dir, repo_name)

    if dry_run:
        return repo_path

    if not os.path.exists(repo_path):
        print(f"[{repo_name}] Cloning from '{clone_url}' into '{repo_path}'...")
        res = subprocess.run(["git", "clone", clone_url, repo_path], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"[CLONE ERROR] [{repo_name}] Failed: {res.stderr}")
            return None
    else:
        print(f"[{repo_name}] Already present at '{repo_path}'.")

    return repo_path

def process_repo_sequentially(repo_info, repo_path, repo_start_date, repo_end_date, push, dry_run):
    repo_name = repo_info['name']
    default_branch = repo_info.get('default_branch', 'main')

    print(f"\n=======================================================")
    print(f"PROCESSING REPOSITORY: {repo_name}")
    print(f"Date Window (10 Days): {repo_start_date.strftime('%Y-%m-%d')} to {repo_end_date.strftime('%Y-%m-%d')}")
    print(f"Commits Per Day Range: {MIN_COMMITS_PER_DAY} to {MAX_COMMITS_PER_DAY}")
    print(f"=======================================================")

    if not dry_run:
        # Checkout default branch
        subprocess.run(["git", "checkout", default_branch], cwd=repo_path, capture_output=True, text=True)
        log_file_path = os.path.join(repo_path, ".activity_log")

    total_commits_created = 0
    current_date = repo_start_date

    for day_offset in range(DAYS_PER_REPO):
        day_date = repo_start_date + timedelta(days=day_offset)
        num_commits = random.randint(MIN_COMMITS_PER_DAY, MAX_COMMITS_PER_DAY)

        timestamps = []
        for _ in range(num_commits):
            hour = random.randint(9, 22)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            dt = datetime.combine(day_date, time(hour, minute, second))
            timestamps.append(dt)
        timestamps.sort()

        for c_idx, ts in enumerate(timestamps, 1):
            iso_date_str = ts.strftime("%Y-%m-%dT%H:%M:%S+05:30")
            commit_msg = f"chore: activity update [{ts.strftime('%Y-%m-%d')} #{c_idx}]"
            log_line = f"Activity entry on {iso_date_str} - commit #{c_idx}\n"

            if dry_run:
                if c_idx == 1 or c_idx == num_commits:
                    print(f"  [DRY-RUN] Day {day_offset+1} ({ts.strftime('%Y-%m-%d')}): commit #{c_idx}/{num_commits} @ {iso_date_str}")
            else:
                with open(log_file_path, "a", encoding="utf-8") as f:
                    f.write(log_line)

                subprocess.run(["git", "add", ".activity_log"], cwd=repo_path, check=True)

                env = os.environ.copy()
                env["GIT_AUTHOR_DATE"] = iso_date_str
                env["GIT_COMMITTER_DATE"] = iso_date_str

                subprocess.run(["git", "commit", "-m", commit_msg], cwd=repo_path, env=env, check=True, stdout=subprocess.DEVNULL)

            total_commits_created += 1

    print(f"\n[DONE 10-DAY BLOCK] Created total {total_commits_created} commits for '{repo_name}'.")

    if push and not dry_run:
        print(f"[{repo_name}] Pushing 10 days of commits to origin/{default_branch}...")
        push_res = subprocess.run(["git", "push", "origin", default_branch], cwd=repo_path, capture_output=True, text=True)
        if push_res.returncode == 0:
            print(f"[PUSH SUCCESS] [{repo_name}] Pushed {total_commits_created} commits to GitHub origin/{default_branch}!")
            return True
        else:
            print(f"[PUSH ERROR] [{repo_name}] Failed to push: {push_res.stderr}")
            return False

    return True

def main():
    args = parse_args()
    if not args.dry_run:
        os.makedirs(TARGET_DIR, exist_ok=True)

    print(f"Fetching repository list for user '{USERNAME}' from GitHub API...")
    repos = get_all_user_repos(USERNAME)
    repos = repos[:args.max_repos]
    total_repos = len(repos)
    print(f"Total Repositories to Process: {total_repos}\n")

    successful_repos = []
    failed_repos = []

    for index, repo in enumerate(repos):
        repo_name = repo['name']
        # Calculate 10-day window for this specific repository
        repo_start_date = START_DATE + timedelta(days=index * DAYS_PER_REPO)
        repo_end_date = repo_start_date + timedelta(days=DAYS_PER_REPO - 1)

        print(f"\n>>> REPOSITORY {index + 1} OF {total_repos}: {repo_name} <<<")

        repo_path = ensure_repo_cloned(repo, TARGET_DIR, dry_run=args.dry_run)
        if repo_path:
            success = process_repo_sequentially(repo, repo_path, repo_start_date, repo_end_date, args.push, args.dry_run)
            if success:
                successful_repos.append(repo_name)
            else:
                failed_repos.append(repo_name)
        else:
            failed_repos.append(repo_name)

    print(f"\n=======================================================")
    print(f"SEQUENTIAL PROCESSING SUMMARY")
    print(f"Total Repositories Processed: {total_repos}")
    print(f"Successful Repositories: {len(successful_repos)}")
    print(f"Failed Repositories: {len(failed_repos)}")
    print(f"=======================================================")

if __name__ == "__main__":
    main()
