// storage-profiles.js

const PROFILES_STORAGE_KEY = 'storageInspector_profiles';

// --- Private Helper Functions ---

function getProfiles() {
    const profilesJson = localStorage.getItem(PROFILES_STORAGE_KEY);
    return profilesJson ? JSON.parse(profilesJson) : {};
}

function saveProfiles(profiles) {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}

function populateDropdown(dropdown, profiles) {
    dropdown.innerHTML = '<option value="">Load Profile...</option>';
    Object.keys(profiles).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        dropdown.appendChild(option);
    });
}

function populateManager(listElement, profiles, onEdit, onDelete) {
    listElement.innerHTML = '';
    if (Object.keys(profiles).length === 0) {
        listElement.innerHTML = '<li class="no-profiles-message">No saved profiles.</li>';
        return;
    }

    const editIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const deleteIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

    Object.keys(profiles).sort().forEach(name => {
        const li = document.createElement('li');
        // MODIFIED: Changed class from 'icon-button' to 'action-btn' to match main table icons
        li.innerHTML = `
            <span class="profile-name">${name}</span>
            <div class="profile-actions">
                <button class="edit-profile-btn action-btn" data-profile-name="${name}" title="Rename Profile">${editIconSVG}</button>
                <button class="delete-profile-btn action-btn" data-profile-name="${name}" title="Delete Profile">${deleteIconSVG}</button>
            </div>
        `;
        li.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-profile-btn');
            const deleteBtn = e.target.closest('.delete-profile-btn');

            if (editBtn) {
                onEdit(editBtn.dataset.profileName);
            } else if (deleteBtn) {
                onDelete(deleteBtn.dataset.profileName);
            }
        });
        listElement.appendChild(li);
    });
}

// --- Exported init Function ---
export function init(elements, getCurrentStorage, onProfileLoad, showTooltip) {
    const { saveBtn, manageBtn, dropdown, modal, modalCloseBtn, modalList } = elements;

    function refreshUI() {
        const profiles = getProfiles();
        populateDropdown(dropdown, profiles);
        populateManager(modalList, profiles, handleEditProfile, handleDeleteProfile);
    }

    function handleSaveProfile() {
        const profileName = prompt("Enter a name for this profile:", "");
        if (!profileName || profileName.trim() === "") return;

        const profiles = getProfiles();
        const trimmedName = profileName.trim();

        if (profiles[trimmedName]) {
            if (!confirm(`A profile named "${trimmedName}" already exists. Overwrite it?`)) {
                return;
            }
        }
        
        const currentStorage = getCurrentStorage();
        const storageData = {};
        for (let i = 0; i < currentStorage.length; i++) {
            const key = currentStorage.key(i);
            storageData[key] = currentStorage.getItem(key);
        }

        profiles[trimmedName] = { data: storageData };
        saveProfiles(profiles);
        refreshUI();
        showTooltip('Profile Saved!', saveBtn);
    }

    function handleLoadProfile(event) {
        const profileName = event.target.value;
        if (!profileName) return;

        if (!confirm(`This will wipe the current storage and load the "${profileName}" profile. Continue?`)) {
            event.target.value = "";
            return;
        }

        const profiles = getProfiles();
        const profile = profiles[profileName];
        if (!profile) {
            showTooltip(`Profile "${profileName}" not found!`, dropdown, { isWarning: true });
            event.target.value = "";
            return;
        }

        const currentStorage = getCurrentStorage();
        currentStorage.clear();
        Object.keys(profile.data).forEach(key => {
            currentStorage.setItem(key, profile.data[key]);
        });

        onProfileLoad();
        showTooltip(`Profile "${profileName}" loaded!`, dropdown);
        event.target.value = "";
    }

    function handleEditProfile(oldName) {
        const newName = prompt(`Rename profile "${oldName}":`, oldName);
        if (!newName || newName.trim() === "" || newName.trim() === oldName) {
            return;
        }

        const profiles = getProfiles();
        const trimmedNewName = newName.trim();

        if (profiles[trimmedNewName]) {
            alert(`A profile named "${trimmedNewName}" already exists. Please choose a different name.`);
            return;
        }

        profiles[trimmedNewName] = profiles[oldName];
        delete profiles[oldName];
        saveProfiles(profiles);
        refreshUI();
        showTooltip('Profile renamed!', modal);
    }

    function handleDeleteProfile(profileName) {
        if (!confirm(`Are you sure you want to delete the profile "${profileName}"? This cannot be undone.`)) {
            return;
        }
        const profiles = getProfiles();
        delete profiles[profileName];
        saveProfiles(profiles);
        refreshUI();
        showTooltip(`Profile "${profileName}" deleted!`, modal, { isWarning: true });
    }

    // Attach event listeners
    saveBtn.addEventListener('click', handleSaveProfile);
    dropdown.addEventListener('change', handleLoadProfile);
    manageBtn.addEventListener('click', () => {
        refreshUI();
        modal.style.display = 'flex';
    });
    modalCloseBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Initial population
    refreshUI();
}