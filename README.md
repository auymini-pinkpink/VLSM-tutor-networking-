# VLSM Tutor — Learn Networking the Easy Way

A modern, professional, beginner-friendly web application designed to help networking students, TAFE/university students, and IT certification candidates (CCNA, CompTIA) master IPv4 subnetting and Variable Length Subnet Masking (VLSM).

---

## Features

1. **Interactive VLSM Calculator:** Enter any starting IPv4 network in CIDR notation (e.g. `192.168.1.0/24`) and multiple department host requirements. The engine validates inputs, sorts requirements largest to smallest, aligns subnets to binary block boundaries, checks capacity, and outputs a complete allocation table with usable IP ranges and broadcast addresses.
2. **Step-by-Step Learning Mode:** Comprehensive lessons covering IPv4 fundamentals, subnet masks, CIDR notation, network vs. host IDs, broadcast addresses, and allocation best practices.
3. **Interactive Quiz:** 10 multiple-choice questions with instant feedback, explanations, and score tracking.
4. **Sample Practice Scenario:** Preloaded enterprise scenario demonstrating how VLSM prevents IP address waste.
5. **Professional UI & Utilities:** Responsive dark theme dashboard with quick sample loading, one-click report copying, and full mobile adaptability.

---

## Local Development Instructions

### Step 1: Open in Visual Studio Code
1. Save all four project files (`index.html`, `styles.css`, `app.js`, `README.md`) into a local folder on your computer.
2. Open **Visual Studio Code**.
3. Go to **File > Open Folder...** and select the folder containing the project files.

### Step 2: Run Locally
To ensure local web font and icon rendering without CORS issues:
1. Install the **Live Server** extension in VS Code (by Ritwick Dey).
2. Right-click on `index.html` in the VS Code file explorer and select **Open with Live Server**.
3. Your default web browser will automatically open the app at `http://127.0.0.1:5500`.

---

## Deployment to GitHub Pages

1. **Create a GitHub Repository:**
   - Log in to [GitHub](https://github.com).
   - Click the **+** icon in the top-right corner and select **New repository**.
   - Name your repository (e.g., `vlsm-tutor`), choose **Public**, and click **Create repository**.

2. **Upload Project Files:**
   - On your repository main page, click **uploading an existing file**.
   - Drag and drop all four project files (`index.html`, `styles.css`, `app.js`, `README.md`) into the browser upload area and click **Commit changes**.

3. **Publish with GitHub Pages:**
   - Go to your repository's **Settings** tab.
   - Click on **Pages** in the left sidebar.
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)`, then click **Save**.
   - Your app will be live at `https://<your-github-username>.github.io/vlsm-tutor/`.

---

## License
Open source under the MIT License.