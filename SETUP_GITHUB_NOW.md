# Set Up GitHub for ForkIt - Execute These Commands

## Step 1: Create GitHub Repository First

**Go to:** https://github.com/new

Fill in:
- **Repository name:** `forkit`
- **Description:** `ForkIt - Random restaurant picker with copycat recipes. Fork indecision. 🍴`
- **Visibility:** Public (required for free GitHub Pages)
- **DO NOT** check any initialization options
- Click **"Create repository"**

**Write down your GitHub username here:** ___________________

---

## Step 2: Initialize Git Locally

Open your terminal and run these commands **one by one**:

```bash
# Navigate to ForkIt directory
cd "C:\Users\cjtucke3\Documents\Personal\Personal_Admin\research\ForkIt"

# Initialize git
git init

# Check status (should show untracked files)
git status
```

---

## Step 3: Verify .env is Ignored

**CRITICAL:** Make sure .env is NOT going to be committed

```bash
# This should show .env under "Ignored files"
git status --ignored | grep -A 5 "Ignored files"
```

If you see `.env` listed under "Ignored files" ✓ Good!
If you DON'T see it, or it shows under "Untracked files" ✗ STOP and check .gitignore

---

## Step 4: Stage All Files

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

**CRITICAL CHECK:** Look at the output. Make sure you DO NOT see:
- `.env` file
- `node_modules/` folder (if it exists)

If you see `.env` in the list, STOP and run:
```bash
git reset
# Then check AppFiles/.gitignore
```

---

## Step 5: Make Initial Commit

```bash
git commit -m "Initial commit: ForkIt app ready for Play Store deployment

- React Native/Expo app for random restaurant selection
- Google Places API integration
- Hidden Gems mode for local discovery
- Make at home feature with recipe links
- Full Play Store deployment documentation
- Privacy policy and security configuration
- EAS Build setup for Android App Bundle
- GitHub Pages with privacy policy hosted"
```

---

## Step 6: Add Remote Repository

**Replace YOUR_GITHUB_USERNAME with your actual username:**

```bash
# Add remote (replace YOUR_GITHUB_USERNAME)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/forkit.git

# Verify remote
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_GITHUB_USERNAME/forkit.git (fetch)
origin  https://github.com/YOUR_GITHUB_USERNAME/forkit.git (push)
```

---

## Step 7: Rename Branch to 'main'

```bash
# Rename branch
git branch -M main
```

---

## Step 8: Push to GitHub

```bash
# Push code
git push -u origin main
```

If prompted for credentials:
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (not your password)

### If You Need a Personal Access Token:

1. Go to: https://github.com/settings/tokens/new
2. Note: "ForkIt deployment"
3. Expiration: 90 days (or custom)
4. Scopes: Check `repo` (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this as your password when pushing

**OR use GitHub CLI (easier):**

```bash
# Install GitHub CLI: https://cli.github.com/
gh auth login
# Follow prompts to authenticate
```

---

## Step 9: Verify Upload

1. Go to: `https://github.com/YOUR_GITHUB_USERNAME/forkit`
2. You should see all your files
3. **CRITICAL:** Check that `.env` is NOT visible
4. Click on `README.md` to see the project page

---

## Step 10: Enable GitHub Pages

1. Go to your repo: `https://github.com/YOUR_GITHUB_USERNAME/forkit`
2. Click **Settings** tab (top right)
3. Scroll down or click **Pages** in left sidebar
4. Under **Source**:
   - Branch: `main`
   - Folder: `/docs`
5. Click **Save**
6. Wait 1-2 minutes for deployment

### Your URLs will be:

- **Privacy Policy:** `https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html`
- **Landing Page:** `https://YOUR_GITHUB_USERNAME.github.io/forkit/`

---

## Step 11: Test Your Pages

After 2-3 minutes, visit:

```
https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html
```

You should see your Privacy Policy with nice styling.

---

## Step 12: Update Documentation with Your GitHub Username

Now that you have GitHub set up, update these files with your actual username:

### Files to Update:

1. **README.md**
   - Replace `YOUR_GITHUB_USERNAME` with actual username
   - Replace `your-email@example.com` with your email
   - Replace `@your_handle` with your Twitter/X handle (if you have one)

2. **docs/privacy.html**
   - Replace `[YOUR_EMAIL_HERE]` with your email
   - Replace `YOUR_GITHUB_USERNAME` with actual username

3. **docs/index.html**
   - Replace `YOUR_GITHUB_USERNAME` with actual username

4. **LICENSE**
   - Replace `[YOUR_NAME]` with your full name

5. **app.json**
   - Add this field inside "expo" object:
   ```json
   "privacy": "https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html"
   ```

### Quick Find & Replace:

```bash
# Go to ForkIt directory
cd "C:\Users\cjtucke3\Documents\Personal\Personal_Admin\research\ForkIt"

# You can manually edit these files or use a text editor's find/replace:
# Find: YOUR_GITHUB_USERNAME
# Replace: your-actual-username
```

---

## Step 13: Commit and Push Updates

After updating the files:

```bash
# Check what changed
git status

# Stage changes
git add .

# Commit
git commit -m "Update documentation with actual GitHub username and contact info"

# Push
git push
```

---

## Step 14: Update app.json with Privacy Policy URL

```bash
cd AppFiles
```

Edit `app.json` and add this field inside the `"expo"` object (after `"description"`):

```json
"privacy": "https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html",
```

Then commit:

```bash
cd ..
git add AppFiles/app.json
git commit -m "Add privacy policy URL to app.json"
git push
```

---

## ✅ Verification Checklist

After completing all steps:

- [ ] GitHub repository created and is public
- [ ] Code pushed to GitHub
- [ ] `.env` is NOT visible in GitHub repository
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Privacy Policy accessible at: `https://YOUR_GITHUB_USERNAME.github.io/forkit/privacy.html`
- [ ] Landing page accessible at: `https://YOUR_GITHUB_USERNAME.github.io/forkit/`
- [ ] README.md updated with your username
- [ ] docs/privacy.html updated with your email
- [ ] docs/index.html updated with your username
- [ ] LICENSE updated with your name
- [ ] app.json updated with privacy policy URL
- [ ] All changes committed and pushed

---

## Common Issues

### Issue: .env appears in GitHub
```bash
# Remove from git
git rm --cached AppFiles/.env

# Commit removal
git commit -m "Remove .env from version control"

# Push
git push
```

### Issue: GitHub Pages shows 404
- Wait 2-5 minutes after enabling Pages
- Check Settings → Pages shows "Your site is published at..."
- Verify `/docs` folder exists and has `privacy.html`
- Check branch is set to `main` and folder is `/docs`

### Issue: Can't push - Authentication failed
**Use Personal Access Token:**
- Go to: https://github.com/settings/tokens/new
- Generate token with `repo` scope
- Use token as password when pushing

**OR use SSH:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: https://github.com/settings/keys

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_GITHUB_USERNAME/forkit.git
```

---

## Next Steps After GitHub Setup

1. ✓ GitHub repository created
2. ✓ Privacy Policy hosted
3. ✓ Documentation updated

**Now you can continue with deployment:**
- Follow `DEPLOYMENT_README.md` for building AAB
- Your Privacy Policy URL is ready for Play Console
- Your GitHub repo is ready for issue tracking and collaboration

---

## Your Links (Fill in after setup):

**GitHub Repository:**
```
https://github.com/___________________/forkit
```

**Privacy Policy:**
```
https://_____________________.github.io/forkit/privacy.html
```

**Landing Page:**
```
https://_____________________.github.io/forkit/
```

---

**That's it! Your GitHub repository is now set up and your Privacy Policy is hosted.** 🎉

Continue with `DEPLOYMENT_README.md` to build and deploy your app!
