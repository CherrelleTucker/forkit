# GitHub Repository Setup for ForkIt

This guide will walk you through creating a GitHub repository for ForkIt and hosting your Privacy Policy.

---

## Step 1: Create GitHub Repository

### 1.1 Go to GitHub
1. Open https://github.com
2. Sign in to your account
3. Click the **"+"** icon in the top-right corner
4. Select **"New repository"**

### 1.2 Configure Repository
Fill in the following:

**Repository name:**
```
forkit
```

**Description:**
```
ForkIt - Random restaurant picker with copycat recipes. Fork indecision. 🍴
```

**Visibility:**
- ✓ **Public** (recommended - required for GitHub Pages)
- OR Private (if you prefer, but GitHub Pages requires paid plan)

**Initialize repository:**
- [ ] ❌ Do NOT check "Add a README file"
- [ ] ❌ Do NOT add .gitignore
- [ ] ❌ Do NOT choose a license yet

**Why?** We already have files locally, so we'll push them up instead.

### 1.3 Create Repository
Click **"Create repository"**

You'll see a page with setup instructions. Keep this page open - we'll use it in Step 3.

---

## Step 2: Initialize Git in ForkIt Directory

### 2.1 Navigate to ForkIt
```bash
cd "C:\Users\cjtucke3\Documents\Personal\Personal_Admin\research\ForkIt"
```

### 2.2 Initialize Git
```bash
# Initialize a new git repository
git init

# Verify initialization
git status
```

You should see all your files as "Untracked files".

---

## Step 3: Add Files and Make Initial Commit

### 3.1 Check What Will Be Committed
```bash
# See what files exist
git status
```

### 3.2 Stage All Files
```bash
# Add all files EXCEPT .env (which is already in .gitignore)
git add .

# Verify .env is NOT staged (very important!)
git status
```

**CRITICAL CHECK:** Make sure `.env` is NOT in the list of staged files.
If it is, something is wrong with `.gitignore`.

### 3.3 Verify .env is Ignored
```bash
# This should show .env is ignored
git status --ignored
```

You should see `.env` under "Ignored files".

### 3.4 Make Initial Commit
```bash
git commit -m "Initial commit: ForkIt app ready for Play Store deployment

- React Native/Expo app for random restaurant selection
- Google Places API integration
- Hidden Gems mode for local discovery
- Make at home feature with recipe links
- Full Play Store deployment documentation
- Privacy policy and security configuration
- EAS Build setup for Android App Bundle
"
```

---

## Step 4: Connect to GitHub Remote

### 4.1 Add Remote Repository
Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/forkit.git

# Verify remote was added
git remote -v
```

### 4.2 Set Default Branch Name
```bash
# Rename branch to 'main' (GitHub's default)
git branch -M main
```

---

## Step 5: Push to GitHub

### 5.1 Push Code
```bash
# Push to GitHub
git push -u origin main
```

If prompted for credentials:
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token**, not your password
  - Get one at: https://github.com/settings/tokens
  - Or use GitHub CLI: `gh auth login`

### 5.2 Verify Upload
1. Go to your GitHub repository: `https://github.com/YOUR_GITHUB_USERNAME/forkit`
2. You should see all your files uploaded
3. **CRITICAL:** Check that `.env` is NOT visible (should be ignored)

---

## Step 6: Create README for GitHub

Let's create a nice README for your GitHub repository.

### 6.1 Create README.md
```bash
cd "C:\Users\cjtucke3\Documents\Personal\Personal_Admin\research\ForkIt"
```

I'll create a comprehensive README for you in the next step.

---

## Step 7: Set Up GitHub Pages for Privacy Policy

### 7.1 Create docs Folder
```bash
# Create docs folder for GitHub Pages
mkdir docs
```

### 7.2 Convert Privacy Policy to HTML
I'll create an HTML version of your privacy policy.

### 7.3 Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: **main**
   - Folder: **/docs**
5. Click **Save**

### 7.4 Wait for Deployment
- GitHub will build your site (takes 1-2 minutes)
- Your Privacy Policy will be at:
  ```
  https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html
  ```

### 7.5 Update App Configuration
Once your Privacy Policy is live, update the URLs in your documentation:
- `app.json` (add privacy field)
- `PRIVACY_POLICY.md` (add hosted URL at top)
- Google Play Console Data Safety form

---

## Step 8: Add License (Optional but Recommended)

### 8.1 Choose a License
For an app, common choices:
- **MIT License** (permissive, allows commercial use)
- **Apache 2.0** (permissive with patent grant)
- **Proprietary** (all rights reserved)

For MVP, MIT is simple and popular.

### 8.2 Add LICENSE File
```bash
# I'll create a LICENSE file for you
```

---

## Step 9: Set Up Repository Settings

### 9.1 Add Topics
In GitHub repository:
1. Click **⚙️ Settings**
2. Add topics:
   - `react-native`
   - `expo`
   - `android`
   - `food`
   - `restaurant`
   - `decision-making`

### 9.2 Add Repository Description
Already done when creating repo, but you can edit it:
```
ForkIt - Random restaurant picker with copycat recipes. Fork indecision. 🍴
```

### 9.3 Update Website URL
Once GitHub Pages is live, add:
```
https://YOUR_GITHUB_USERNAME.github.io/forkit/
```

---

## Step 10: Set Up Branch Protection (Optional)

For solo development, this is optional. But it's good practice:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✓ Require pull request before merging
   - ✓ Require status checks to pass

This prevents accidental pushes to main.

---

## Step 11: Update Documentation with GitHub URLs

Once your repo is live, update these files with your actual GitHub username:

### Files to Update:
1. `PRIVACY_POLICY.md` - Add hosted URL at top
2. `DEPLOYMENT_README.md` - Replace `[YOUR_GITHUB_URL]` placeholders
3. `GOOGLE_PLAY_CONSOLE_SETUP.md` - Replace `[YOUR_GITHUB_REPO_HERE]`
4. `app.json` - Add privacy policy URL

I'll help you make these updates after you have the GitHub username.

---

## Common Issues & Solutions

### Issue: .env File Appears in Git
**Solution:**
```bash
# Remove from staging
git rm --cached .env

# Verify .gitignore includes .env
cat .gitignore | grep .env

# Commit the removal
git commit -m "Remove .env from version control"
git push
```

### Issue: Can't Push - Authentication Failed
**Solutions:**

**Option 1: Use Personal Access Token**
```bash
# Generate token at: https://github.com/settings/tokens
# When prompted for password, use the token instead
```

**Option 2: Use GitHub CLI**
```bash
# Install GitHub CLI: https://cli.github.com/
gh auth login
# Follow prompts
```

**Option 3: Use SSH**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: https://github.com/settings/keys

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_GITHUB_USERNAME/forkit.git
```

### Issue: GitHub Pages Not Working
**Checks:**
1. Repository is public (or you have GitHub Pro for private pages)
2. `/docs` folder exists and has `privacy.html`
3. Committed and pushed to `main` branch
4. Wait 2-5 minutes for deployment
5. Check deployment status in Settings → Pages

---

## Git Workflow for Future Updates

### Making Changes
```bash
# 1. Check current status
git status

# 2. Make your changes to files

# 3. See what changed
git diff

# 4. Stage changes
git add .

# 5. Commit with descriptive message
git commit -m "Update feature: improve filter logic"

# 6. Push to GitHub
git push
```

### Best Practices
- Commit often with clear messages
- Use branches for new features
- Never commit `.env` or secrets
- Write descriptive commit messages

---

## Complete Setup Checklist

- [ ] GitHub repository created
- [ ] Local git initialized
- [ ] Files staged and committed
- [ ] Remote repository added
- [ ] Code pushed to GitHub
- [ ] Verified `.env` is NOT in repository
- [ ] Created `/docs` folder
- [ ] Created HTML privacy policy
- [ ] Enabled GitHub Pages
- [ ] Verified Privacy Policy is accessible
- [ ] Updated documentation with GitHub URLs
- [ ] Added topics to repository
- [ ] Created README.md for GitHub
- [ ] Added LICENSE file (optional)

---

## Next Steps After GitHub Setup

1. **Get Privacy Policy URL:**
   ```
   https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html
   ```

2. **Update app.json:**
   ```json
   "privacy": "https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html"
   ```

3. **Update Play Console Data Safety form** with Privacy Policy URL

4. **Continue with deployment** following `DEPLOYMENT_README.md`

---

## Quick Reference Commands

```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# See what's ignored
git status --ignored
```

---

**Your GitHub repository will be at:**
```
https://github.com/YOUR_GITHUB_USERNAME/forkit
```

**Your Privacy Policy will be at:**
```
https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html
```
