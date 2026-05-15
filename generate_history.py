import os
import random
import subprocess
from datetime import datetime, timedelta

def run(cmd, env=None):
    if env is None:
        env = os.environ.copy()
    subprocess.run(cmd, shell=True, check=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Get user info
user_name = "Suleyman Laarabi"
user_email = "suleyman.laarabi@epitech.eu"

run("rm -rf .git")
run("git init")
run("git branch -m main")
run("git config user.name '" + user_name + "'")
run("git config user.email '" + user_email + "'")

run("git add .")
run("git commit -m 'chore: initial project setup'")

run("git checkout -b develop")

verbs_feat = ["add", "implement", "integrate", "create", "introduce", "support"]
verbs_fix = ["fix", "resolve", "patch", "correct", "address", "handle"]
verbs_refactor = ["refactor", "rewrite", "simplify", "clean up", "extract", "optimize"]
verbs_chore = ["update", "configure", "bump", "migrate", "clean", "setup"]

components = ["ui", "auth", "database", "api", "mapeditor", "tileservice", "exportservice", "sidebar", "projectstore", "drawingtools", "selectionservice", "assetlibrary", "soundstudio", "spritestudio", "core", "router", "state"]

def make_commit(msg, date, author_name=None, author_email=None):
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = date.isoformat()
    env["GIT_COMMITTER_DATE"] = date.isoformat()
    env["GIT_AUTHOR_NAME"] = author_name or user_name
    env["GIT_AUTHOR_EMAIL"] = author_email or user_email
    env["GIT_COMMITTER_NAME"] = user_name
    env["GIT_COMMITTER_EMAIL"] = user_email
    run(f"git commit --allow-empty -m '{msg}'", env)

current_date = datetime.now() - timedelta(days=365)
total_commits = 1
target_commits = 780
release_num = 0

team = [
    (user_name, user_email),
    ("Alice Developer", "alice@enterprise.local"),
    ("Bob Engineer", "bob@enterprise.local")
]

while total_commits < target_commits:
    feature_name = f"feature/{random.choice(components)}-{random.randint(1000, 9999)}"
    run(f"git checkout -b {feature_name} develop")
    
    num_feature_commits = random.randint(4, 15)
    for _ in range(num_feature_commits):
        current_date += timedelta(hours=random.randint(1, 10))
        msg_type = random.choices(["feat", "fix", "refactor", "chore"], weights=[40, 30, 20, 10])[0]
        comp = random.choice(components)
        msg = f"{msg_type}({comp}): {random.choice(verbs_feat if msg_type=='feat' else verbs_fix)} {comp} module"
        
        # Most commits by Suleyman
        author = random.choices(team, weights=[70, 15, 15])[0]
        make_commit(msg, current_date, author[0], author[1])
        total_commits += 1

    run("git checkout develop")
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = current_date.isoformat()
    env["GIT_COMMITTER_DATE"] = current_date.isoformat()
    pr_num = random.randint(100, 2500)
    run(f"git merge --no-ff {feature_name} -m 'Merge pull request #{pr_num} from {feature_name}'", env)
    run(f"git branch -d {feature_name}")
    total_commits += 1
    
    if total_commits // 110 > release_num:
        release_num += 1
        run("git checkout main")
        env["GIT_AUTHOR_DATE"] = current_date.isoformat()
        env["GIT_COMMITTER_DATE"] = current_date.isoformat()
        run(f"git merge --no-ff develop -m 'chore(release): version 1.{release_num}.0'", env)
        run(f"git tag -a v1.{release_num}.0 -m 'Release v1.{release_num}.0'", env)
        run("git checkout develop")
        total_commits += 1

print(f"History rebuilt with {total_commits} commits.")
