/**
 * Automated Java JDK Setup Script for Cloud Deployments (Render Native Node, etc.)
 * Ensures 'javac' and 'java' are available for live multi-language code evaluation.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkJavac() {
    try {
        const out = execSync('javac -version', { stdio: 'pipe' }).toString();
        return out.trim();
    } catch (e) {
        return null;
    }
}

function main() {
    console.log('[JDK Setup] Checking for existing Java compiler (javac)...');
    const existing = checkJavac();
    if (existing) {
        console.log(`[JDK Setup] Existing ${existing} detected in PATH. No setup needed.`);
        return;
    }

    // Check if server/bin/jdk already exists
    const targetDir = path.join(__dirname, '../server/bin/jdk');
    const javacBin = path.join(targetDir, 'bin', process.platform === 'win32' ? 'javac.exe' : 'javac');
    if (fs.existsSync(javacBin)) {
        console.log('[JDK Setup] Portable OpenJDK already extracted in server/bin/jdk.');
        return;
    }

    if (process.platform !== 'linux') {
        console.log(`[JDK Setup] Host platform is ${process.platform}. Please ensure Java JDK is installed locally.`);
        return;
    }

    console.log('[JDK Setup] javac not found on Linux host. Installing portable OpenJDK 17 for code judge...');

    try {
        fs.mkdirSync(targetDir, { recursive: true });

        const jdkUrl = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.21%2B9/OpenJDK17U-jdk_x64_linux_hotspot_17.0.21_9.tar.gz';
        console.log(`[JDK Setup] Downloading Eclipse Temurin OpenJDK 17...`);

        // Use curl and tar available on all Linux images
        const cmd = `curl -fsSL "${jdkUrl}" | tar -xz -C "${targetDir}" --strip-components=1`;
        execSync(cmd, { stdio: 'inherit', timeout: 180000 });

        if (fs.existsSync(javacBin)) {
            // Ensure execute permissions on bin files
            try { execSync(`chmod +x "${targetDir}/bin/"*`, { stdio: 'ignore' }); } catch (e) {}
            console.log('[JDK Setup] OpenJDK 17 installed successfully into server/bin/jdk!');

            try {
                const utilsDir = path.join(__dirname, '../server/utils');
                execSync(`"${javacBin}" -encoding UTF-8 JavaRunner.java`, { cwd: utilsDir, stdio: 'inherit' });
                console.log('[JDK Setup] Pre-compiled JavaRunner harness successfully.');
            } catch (e) {
                console.warn('[JDK Setup] Notice on harness pre-compile:', e.message);
            }
        } else {
            console.warn('[JDK Setup] Warning: javac binary not found after extraction.');
        }
    } catch (err) {
        console.warn('[JDK Setup] Warning: Could not complete automatic JDK download:', err.message);
        console.warn('[JDK Setup] Tip: Switch to Docker Environment on Render for guaranteed compiler availability.');
    }
}

main();
