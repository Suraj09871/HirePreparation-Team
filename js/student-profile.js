let state = {
    profile: null,
    additionalDetails: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    if (!API.isLoggedIn()) return window.location.href = '/index.html';
    
    const user = API.getUser();
    if (document.getElementById('sideName')) document.getElementById('sideName').textContent = user.name;
    if (document.getElementById('sideEmail')) document.getElementById('sideEmail').textContent = user.email;

    // Fetch profile
    try {
        const data = await API.get('/profile');
        state.profile = data.profile;
        state.additionalDetails = data.profile.additionalDetails || {};
        populateUI();
    } catch (e) {
        console.error('Error fetching profile:', e.message);
    }

    setupInteractions();
});

function setupInteractions() {
    // Settings Tab switching
    const tabMap = ['edit-profile', 'tab-profile-image', 'tab-password', 'tab-privacy', 'tab-delete'];
    document.querySelectorAll('.settings-tab').forEach((tab, idx) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Hide all panels
            document.querySelector('.accordion-wrapper').style.display = idx === 0 ? 'block' : 'none';
            document.querySelectorAll('[id^="tab-profile-image"], #tab-password, #tab-privacy, #tab-delete').forEach(el => el.style.display = 'none');
            // Also hide/show resume CTA
            const cta = document.querySelector('.accordion-wrapper').previousElementSibling;
            if (cta && cta.style) cta.style.display = idx === 0 ? 'flex' : 'none';
            // Show selected
            if (idx > 0) {
                const panel = document.getElementById(tabMap[idx]);
                if (panel) panel.style.display = 'block';
            }
        });
    });

    // Accordions
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });

    // Pill groups (Radio behavior)
    document.querySelectorAll('.pill-group').forEach(group => {
        group.addEventListener('click', (e) => {
            if (e.target.classList.contains('pill-btn')) {
                // Deselect siblings
                group.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
                // Select clicked
                e.target.classList.add('active');
            }
        });
    });

    // Resume Upload (Legacy Logic)
    const resumeBtn = document.getElementById('resumeBtn');
    const resumeInput = document.getElementById('resumeInput');
    if (resumeBtn && resumeInput) {
        resumeBtn.addEventListener('click', () => resumeInput.click());
        resumeInput.addEventListener('change', async () => {
            const file = resumeInput.files[0];
            if (!file) return;
            const fd = new FormData();
            fd.append('resume', file);
            try {
                const data = await API.upload('/profile/resume', fd);
                showToast('Resume uploaded! Score: ' + data.resumeScore);
                const scoreEl = document.getElementById('resumeScore');
                if (scoreEl) scoreEl.textContent = data.resumeScore;
            } catch (e) { showToast(e.message, 'error'); }
        });
    }
}

function populateUI() {
    const p = state.profile;
    const ad = state.additionalDetails;

    // Basic Details mapped fields
    if(document.getElementById('profileName')) document.getElementById('profileName').value = p.name || '';
    if(document.getElementById('profileEmail')) document.getElementById('profileEmail').value = p.email || '';
    if(document.getElementById('profilePhone')) document.getElementById('profilePhone').value = p.phone || '';
    
    // Additional Details Mapping
    if(document.getElementById('profileTitle')) document.getElementById('profileTitle').value = ad.title || '';
    if(document.getElementById('profileDob')) document.getElementById('profileDob').value = ad.dob || '';
    if(document.getElementById('profileCourse')) document.getElementById('profileCourse').value = ad.course || '';
    if(document.getElementById('profileSpecialization')) document.getElementById('profileSpecialization').value = ad.specialization || '';
    if(document.getElementById('profileAddress')) document.getElementById('profileAddress').value = ad.address || '';
    if(document.getElementById('profileLandmark')) document.getElementById('profileLandmark').value = ad.landmark || '';
    if(document.getElementById('profilePincode')) document.getElementById('profilePincode').value = ad.pincode || '';
    if(document.getElementById('profileCity')) document.getElementById('profileCity').value = ad.city || '';
    if(document.getElementById('profileHobbies')) document.getElementById('profileHobbies').value = ad.hobbies || '';

    // Pills activation
    activatePill('genderGroup', ad.gender);
    activatePill('userTypeGroup', ad.userType);
    activatePill('domainGroup', ad.domain);
    activatePill('pronounsGroup', ad.pronouns);

    // Resume Score
    if (p.resumeScore && document.getElementById('resumeScore')) {
        document.getElementById('resumeScore').textContent = p.resumeScore;
    }
}

function activatePill(groupId, value) {
    if (!value) return;
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.pill-btn').forEach(btn => {
        if (btn.dataset.value === value) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function getSelectedPill(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return null;
    const active = group.querySelector('.pill-btn.active');
    return active ? active.dataset.value : null;
}

async function saveBasicDetails() {
    const payload = {
        name: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        additionalDetails: {
            title: document.getElementById('profileTitle').value,
            dob: document.getElementById('profileDob').value,
            gender: getSelectedPill('genderGroup'),
            userType: getSelectedPill('userTypeGroup'),
            domain: getSelectedPill('domainGroup'),
            course: document.getElementById('profileCourse').value,
            specialization: document.getElementById('profileSpecialization').value,
        }
    };
    
    try {
        await API.put('/profile', payload);
        showToast('Basic Details saved!');
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function savePersonalDetails() {
    const payload = {
        additionalDetails: {
            pronouns: getSelectedPill('pronounsGroup'),
            address: document.getElementById('profileAddress').value,
            landmark: document.getElementById('profileLandmark').value,
            pincode: document.getElementById('profilePincode').value,
            city: document.getElementById('profileCity').value,
            hobbies: document.getElementById('profileHobbies').value
        }
    };
    
    try {
        await API.put('/profile', payload);
        showToast('Personal Details saved!');
    } catch (e) {
        showToast(e.message, 'error');
    }
}
