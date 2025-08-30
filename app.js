class ResumeBuilder {
    constructor() {
        this.currentTemplate = 'classic';
        this.resumeData = {
            personal: {},
            education: [],
            experience: [],
            skills: [],
            projects: [],
            achievements: []
        };
        
        this.init();
        this.loadFromStorage();
    }

    init() {
        this.setupEventListeners();
        this.updatePreview();
    }

    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTemplate = e.target.dataset.template;
                this.updatePreview();
            });
        });

        // Theme color change
        document.getElementById('themeColor').addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--primary-color', e.target.value);
            this.updatePreview();
        });

        // Font family change
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--font-family', e.target.value);
            this.updatePreview();
        });

        // Personal info inputs
        const personalInputs = ['fullName', 'email', 'phone', 'location', 'linkedin', 'github', 'summary'];
        personalInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.resumeData.personal[id] = element.value;
                    this.updatePreview();
                });
            }
        });

        // Skills input
        document.getElementById('skillsInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addSkill();
            }
        });

        document.getElementById('skillsInput').addEventListener('blur', () => {
            this.addSkill();
        });

        // Add buttons
        document.getElementById('addEducation').addEventListener('click', () => this.addEducation());
        document.getElementById('addExperience').addEventListener('click', () => this.addExperience());
        document.getElementById('addProject').addEventListener('click', () => this.addProject());
        document.getElementById('addAchievement').addEventListener('click', () => this.addAchievement());

        // Action buttons
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveToStorage());

        // New Resume button
        document.getElementById('newResumeBtn').addEventListener('click', () => this.newResume());
        
        // Clear buttons
        document.getElementById('clearSummaryBtn').addEventListener('click', () => this.clearSummary());
        document.getElementById('clearEducationBtn').addEventListener('click', () => this.clearEducation());
        document.getElementById('clearExperienceBtn').addEventListener('click', () => this.clearExperience());
        document.getElementById('clearProjectsBtn').addEventListener('click', () => this.clearProjects());
        document.getElementById('clearAchievementsBtn').addEventListener('click', () => this.clearAchievements());

        // Initialize with one entry for each section
        this.setupInitialEntries();
    }

    setupInitialEntries() {
        // Initialize with one entry for each section by default
        this.addEducation();
        this.addExperience(); 
        this.addProject();
        this.addAchievement();
    }

    addSkill() {
        const input = document.getElementById('skillsInput');
        const skills = input.value.split(',').map(s => s.trim()).filter(s => s);
        
        skills.forEach(skill => {
            if (skill && !this.resumeData.skills.includes(skill)) {
                this.resumeData.skills.push(skill);
            }
        });
        
        input.value = '';
        this.renderSkillsTags();
        this.updatePreview();
    }

    renderSkillsTags() {
        const container = document.getElementById('skillsTags');
        container.innerHTML = this.resumeData.skills.map(skill => `
            <span class="skill-tag">
                ${skill}
                <i class="fas fa-times remove" onclick="resumeBuilder.removeSkill('${skill}')"></i>
            </span>
        `).join('');
    }

    removeSkill(skill) {
        this.resumeData.skills = this.resumeData.skills.filter(s => s !== skill);
        this.renderSkillsTags();
        this.updatePreview();
    }

    addEducation() {
        const index = this.resumeData.education.length;
        this.resumeData.education.push({});
        this.addEducationEntry(index);
    }

    addEducationEntry(index) {
        const container = document.getElementById('educationContainer');
        
        const html = `
            <div class="education-entry" data-index="${index}">
                <button type="button" class="remove-btn" onclick="resumeBuilder.removeEducation(${index})">×</button>
                <div class="form-row">
                    <input type="text" class="degree" placeholder="Degree" data-field="degree">
                    <input type="text" class="institution" placeholder="Institution" data-field="institution">
                </div>
                <div class="form-row">
                    <input type="text" class="year" placeholder="Year" data-field="year">
                    <input type="text" class="grade" placeholder="Grade/GPA (optional)" data-field="grade">
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
        this.setupEducationListeners();
    }

    removeEducation(index) {
        document.querySelector(`[data-index="${index}"]`).remove();
        this.resumeData.education.splice(index, 1);
        this.updateEducationIndices();
        this.updatePreview();
    }

    updateEducationIndices() {
        document.querySelectorAll('.education-entry').forEach((entry, index) => {
            entry.dataset.index = index;
            entry.querySelector('.remove-btn').onclick = () => this.removeEducation(index);
        });
    }

    setupEducationListeners() {
        document.querySelectorAll('.education-entry input').forEach(input => {
            input.addEventListener('input', (e) => {
                const entry = e.target.closest('.education-entry');
                const index = parseInt(entry.dataset.index);
                const field = e.target.dataset.field;
                
                if (!this.resumeData.education[index]) {
                    this.resumeData.education[index] = {};
                }
                
                this.resumeData.education[index][field] = e.target.value;
                this.updatePreview();
            });
        });
    }

    addExperience() {
        const index = this.resumeData.experience.length;
        this.resumeData.experience.push({});
        this.addExperienceEntry(index);
    }

    addExperienceEntry(index) {
        const container = document.getElementById('experienceContainer');
        
        const html = `
            <div class="experience-entry" data-index="${index}">
                <button type="button" class="remove-btn" onclick="resumeBuilder.removeExperience(${index})">×</button>
                <div class="form-row">
                    <input type="text" class="jobTitle" placeholder="Job Title" data-field="jobTitle">
                    <input type="text" class="company" placeholder="Company" data-field="company">
                </div>
                <div class="form-row">
                    <input type="text" class="duration" placeholder="Duration (e.g., Jan 2020 - Present)" data-field="duration">
                </div>
                <textarea class="description" placeholder="Job description and achievements (optional)" rows="3" data-field="description"></textarea>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
        this.setupExperienceListeners();
    }

    removeExperience(index) {
        document.querySelector(`.experience-entry[data-index="${index}"]`).remove();
        this.resumeData.experience.splice(index, 1);
        this.updateExperienceIndices();
        this.updatePreview();
    }

    updateExperienceIndices() {
        document.querySelectorAll('.experience-entry').forEach((entry, index) => {
            entry.dataset.index = index;
            entry.querySelector('.remove-btn').onclick = () => this.removeExperience(index);
        });
    }

    setupExperienceListeners() {
        document.querySelectorAll('.experience-entry input, .experience-entry textarea').forEach(input => {
            input.addEventListener('input', (e) => {
                const entry = e.target.closest('.experience-entry');
                const index = parseInt(entry.dataset.index);
                const field = e.target.dataset.field;
                
                if (!this.resumeData.experience[index]) {
                    this.resumeData.experience[index] = {};
                }
                
                this.resumeData.experience[index][field] = e.target.value;
                this.updatePreview();
            });
        });
    }

    addProject() {
        const index = this.resumeData.projects.length;
        this.resumeData.projects.push({});
        this.addProjectEntry(index);
    }

    addProjectEntry(index) {
        const container = document.getElementById('projectsContainer');
        
        const html = `
            <div class="project-entry" data-index="${index}">
                <button type="button" class="remove-btn" onclick="resumeBuilder.removeProject(${index})">×</button>
                <div class="form-group">
                    <input type="text" class="projectTitle" placeholder="Project Title" data-field="title">
                </div>
                <div class="form-group">
                    <textarea class="projectDescription" placeholder="Brief description of the project" rows="2" data-field="description"></textarea>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
        this.setupProjectListeners();
    }

    removeProject(index) {
        document.querySelector(`.project-entry[data-index="${index}"]`).remove();
        this.resumeData.projects.splice(index, 1);
        this.updateProjectIndices();
        this.updatePreview();
    }

    updateProjectIndices() {
        document.querySelectorAll('.project-entry').forEach((entry, index) => {
            entry.dataset.index = index;
            entry.querySelector('.remove-btn').onclick = () => this.removeProject(index);
        });
    }

    setupProjectListeners() {
        document.querySelectorAll('.project-entry input, .project-entry textarea').forEach(input => {
            input.addEventListener('input', (e) => {
                const entry = e.target.closest('.project-entry');
                const index = parseInt(entry.dataset.index);
                const field = e.target.dataset.field;
                
                if (!this.resumeData.projects[index]) {
                    this.resumeData.projects[index] = {};
                }
                
                this.resumeData.projects[index][field] = e.target.value;
                this.updatePreview();
            });
        });
    }

    addAchievement() {
        const index = this.resumeData.achievements.length;
        this.resumeData.achievements.push({});
        this.addAchievementEntry(index);
    }

    addAchievementEntry(index) {
        const container = document.getElementById('achievementsContainer');
        
        const html = `
            <div class="achievement-entry" data-index="${index}">
                <button type="button" class="remove-btn" onclick="resumeBuilder.removeAchievement(${index})">×</button>
                <input type="text" class="achievement" placeholder="Achievement or Certification" data-field="text">
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
        this.setupAchievementListeners();
    }

    removeAchievement(index) {
        document.querySelector(`.achievement-entry[data-index="${index}"]`).remove();
        this.resumeData.achievements.splice(index, 1);
        this.updateAchievementIndices();
        this.updatePreview();
    }

    updateAchievementIndices() {
        document.querySelectorAll('.achievement-entry').forEach((entry, index) => {
            entry.dataset.index = index;
            entry.querySelector('.remove-btn').onclick = () => this.removeAchievement(index);
        });
    }

    setupAchievementListeners() {
        document.querySelectorAll('.achievement-entry input').forEach(input => {
            input.addEventListener('input', (e) => {
                const entry = e.target.closest('.achievement-entry');
                const index = parseInt(entry.dataset.index);
                const field = e.target.dataset.field;
                
                if (!this.resumeData.achievements[index]) {
                    this.resumeData.achievements[index] = {};
                }
                
                this.resumeData.achievements[index][field] = e.target.value;
                this.updatePreview();
            });
        });
    }

    updatePreview() {
        const preview = document.getElementById('resumePreview');
        const template = this.getTemplate();
        preview.innerHTML = template;
    }

    getTemplate() {
        switch (this.currentTemplate) {
            case 'modern':
                return this.getModernTemplate();
            case 'minimal':
                return this.getMinimalTemplate();
            default:
                return this.getClassicTemplate();
        }
    }

    getClassicTemplate() {
        const { personal, education, experience, skills, projects, achievements } = this.resumeData;
        
        return `
            <div class="resume-template template-classic">
                <div class="resume-header">
                    <div class="resume-name">${personal.fullName || 'Your Name'}</div>
                    <div class="resume-contact">
                        ${personal.email ? `<span><i class="fas fa-envelope"></i> ${personal.email}</span>` : ''}
                        ${personal.phone ? `<span><i class="fas fa-phone"></i> ${personal.phone}</span>` : ''}
                        ${personal.location ? `<span><i class="fas fa-location-dot"></i> ${personal.location}</span>` : ''}
                        ${personal.linkedin ? `<span><i class="fab fa-linkedin"></i> ${personal.linkedin}</span>` : ''}
                        ${personal.github ? `<span><i class="fab fa-github"></i> ${personal.github}</span>` : ''}
                    </div>
                </div>

                ${personal.summary ? `
                    <div class="resume-section">
                        <div class="section-title">Professional Summary</div>
                        <p style="white-space: pre-wrap; word-wrap: break-word;">${personal.summary}</p>
                    </div>
                ` : ''}

                ${experience.filter(exp => exp.jobTitle).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Work Experience</div>
                        ${experience.map(exp => exp.jobTitle ? `
                            <div class="section-item">
                                <div class="item-title">${exp.jobTitle}</div>
                                <div class="item-subtitle">${exp.company}</div>
                                ${exp.duration ? `<div class="item-duration">${exp.duration}</div>` : ''}
                                ${exp.description ? `<p style="white-space: pre-wrap; word-wrap: break-word; margin-top: 0.5rem;">${exp.description}</p>` : ''}
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${education.filter(edu => edu.degree).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Education</div>
                        ${education.map(edu => edu.degree ? `
                            <div class="section-item">
                                <div class="item-title">${edu.degree}</div>
                                <div class="item-subtitle">${edu.institution} ${edu.year ? `• ${edu.year}` : ''} ${edu.grade ? `• ${edu.grade}` : ''}</div>
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${skills.length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Skills</div>
                        <div class="skills-grid">
                            ${skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${projects.filter(proj => proj.title).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Projects</div>
                        ${projects.map(proj => proj.title ? `
                            <div class="section-item">
                                <div class="item-title">${proj.title}</div>
                                ${proj.description ? `<p style="white-space: pre-wrap; word-wrap: break-word;">${proj.description}</p>` : ''}
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${achievements.filter(ach => ach.text).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Achievements & Certifications</div>
                        ${achievements.map(ach => ach.text ? `
                            <div class="section-item">
                                <div class="item-title">${ach.text}</div>
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getModernTemplate() {
        const { personal, education, experience, skills, projects, achievements } = this.resumeData;
        
        return `
            <div class="resume-template template-modern">
                <div class="resume-header">
                    <div class="resume-name">${personal.fullName || 'Your Name'}</div>
                    <div class="resume-contact">
                        ${personal.email ? `<span><i class="fas fa-envelope"></i> ${personal.email}</span>` : ''}
                        ${personal.phone ? `<span><i class="fas fa-phone"></i> ${personal.phone}</span>` : ''}
                        ${personal.location ? `<span><i class="fas fa-location-dot"></i> ${personal.location}</span>` : ''}
                        ${personal.linkedin ? `<span><i class="fab fa-linkedin"></i> ${personal.linkedin}</span>` : ''}
                        ${personal.github ? `<span><i class="fab fa-github"></i> ${personal.github}</span>` : ''}
                    </div>
                </div>

                ${personal.summary ? `
                    <div class="resume-section">
                        <div class="section-title"><i class="fas fa-user"></i> About Me</div>
                        <p style="white-space: pre-wrap; word-wrap: break-word;">${personal.summary}</p>
                    </div>
                ` : ''}

                ${experience.filter(exp => exp.jobTitle).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title"><i class="fas fa-briefcase"></i> Experience</div>
                        ${experience.map(exp => exp.jobTitle ? `
                            <div class="section-item">
                                <div class="item-title">${exp.jobTitle}</div>
                                <div class="item-subtitle">${exp.company}</div>
                                ${exp.duration ? `<div class="item-duration">${exp.duration}</div>` : ''}
                                ${exp.description ? `<p style="white-space: pre-wrap; word-wrap: break-word; margin-top: 0.5rem;">${exp.description}</p>` : ''}
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${education.filter(edu => edu.degree).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title"><i class="fas fa-graduation-cap"></i> Education</div>
                        ${education.map(edu => edu.degree ? `
                            <div class="section-item">
                                <div class="item-title">${edu.degree}</div>
                                <div class="item-subtitle">${edu.institution} ${edu.year ? `• ${edu.year}` : ''} ${edu.grade ? `• ${edu.grade}` : ''}</div>
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${skills.length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title"><i class="fas fa-star"></i> Skills</div>
                        <div class="skills-grid">
                            ${skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${projects.filter(proj => proj.title).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title"><i class="fas fa-project-diagram"></i> Projects</div>
                        ${projects.map(proj => proj.title ? `
                            <div class="section-item">
                                <div class="item-title">${proj.title}</div>
                                ${proj.description ? `<p style="white-space: pre-wrap; word-wrap: break-word;">${proj.description}</p>` : ''}
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${achievements.filter(ach => ach.text).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title"><i class="fas fa-trophy"></i> Achievements</div>
                        ${achievements.map(ach => ach.text ? `
                            <div class="section-item">
                                <div class="item-title">${ach.text}</div>
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getMinimalTemplate() {
        const { personal, education, experience, skills, projects, achievements } = this.resumeData;
        
        return `
            <div class="resume-template template-minimal">
                <div class="resume-header">
                    <div class="resume-name">${personal.fullName || 'Your Name'}</div>
                    <div class="resume-contact">
                        ${personal.email ? `<span>${personal.email}</span>` : ''}
                        ${personal.phone ? `<span>${personal.phone}</span>` : ''}
                        ${personal.location ? `<span>${personal.location}</span>` : ''}
                        ${personal.linkedin ? `<span>${personal.linkedin}</span>` : ''}
                        ${personal.github ? `<span>${personal.github}</span>` : ''}
                    </div>
                </div>

                ${personal.summary ? `
                    <div class="resume-section">
                        <div class="section-title">Summary</div>
                        <p style="white-space: pre-wrap; word-wrap: break-word;">${personal.summary}</p>
                    </div>
                ` : ''}

                ${experience.filter(exp => exp.jobTitle).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Experience</div>
                        ${experience.map(exp => exp.jobTitle ? `
                            <div class="section-item">
                                <div class="item-title">${exp.jobTitle} at ${exp.company}</div>
                                ${exp.duration ? `<div class="item-duration">${exp.duration}</div>` : ''}
                                ${exp.description ? `<p style="white-space: pre-wrap; word-wrap: break-word;">${exp.description}</p>` : ''}
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${education.filter(edu => edu.degree).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Education</div>
                        ${education.map(edu => edu.degree ? `
                            <div class="section-item">
                                <div class="item-title">${edu.degree}</div>
                                <div class="item-subtitle">${edu.institution} ${edu.year ? `• ${edu.year}` : ''} ${edu.grade ? `• ${edu.grade}` : ''}</div>
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${skills.length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Skills</div>
                        <p style="white-space: pre-wrap; word-wrap: break-word;">${skills.join(' • ')}</p>
                    </div>
                ` : ''}

                ${projects.filter(proj => proj.title).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Projects</div>
                        ${projects.map(proj => proj.title ? `
                            <div class="section-item">
                                <div class="item-title">${proj.title}</div>
                                ${proj.description ? `<p style="white-space: pre-wrap; word-wrap: break-word;">${proj.description}</p>` : ''}
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}

                ${achievements.filter(ach => ach.text).length > 0 ? `
                    <div class="resume-section">
                        <div class="section-title">Achievements</div>
                        ${achievements.map(ach => ach.text ? `
                            <div class="section-item">
                                <div class="item-title">${ach.text}</div>
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    async downloadPDF() {
        const button = document.getElementById('downloadBtn');
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> Generating PDF...';
        button.disabled = true;

        const element = document.getElementById('resumePreview');
        const fileName = this.resumeData.personal.fullName ? 
            `${this.resumeData.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf` : 
            'Resume.pdf';

        // Store original styles
        const originalMaxHeight = element.style.maxHeight;
        const originalOverflowY = element.style.overflowY;

        try {
            // Wait for all web fonts to be loaded before rendering to canvas
            // This helps ensure fonts are correctly applied in the PDF output.
            await document.fonts.ready;

            // Temporarily adjust styles for full content capture by html2canvas
            element.style.maxHeight = 'none';
            element.style.overflowY = 'visible';
            
            const options = {
                margin: 10,
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 3, // Increased scale for higher resolution, improving font appearance, spacing, and alignment fidelity
                    useCORS: true,
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'] } // Auto-splits into pages
            };

            await html2pdf().set(options).from(element).save();

            // Success animation
            button.classList.add('success-animation');
            setTimeout(() => button.classList.remove('success-animation'), 600);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            // Restore original styles
            element.style.maxHeight = originalMaxHeight;
            element.style.overflowY = originalOverflowY;

            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    saveToStorage() {
        localStorage.setItem('resumeData', JSON.stringify(this.resumeData));
        
        const button = document.getElementById('saveBtn');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Saved!';
        button.classList.add('success-animation');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('success-animation');
        }, 1500);
    }

    loadFromStorage() {
        const saved = localStorage.getItem('resumeData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.resumeData = { ...this.resumeData, ...data };
                this.populateForm();
                this.updatePreview();
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    populateForm() {
        // Populate personal info
        Object.entries(this.resumeData.personal).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.value = value || '';
            }
        });

        // Populate skills
        this.renderSkillsTags();

        // Populate dynamic sections
        this.populateEducation();
        this.populateExperience();
        this.populateProjects();
        this.populateAchievements();
    }

    populateEducation() {
        const container = document.getElementById('educationContainer');
        container.innerHTML = '';
        
        // Always ensure at least one entry exists
        if (this.resumeData.education.length === 0) {
            this.resumeData.education.push({});
        }
        
        this.resumeData.education.forEach((edu, index) => {
            this.addEducationEntry(index);
            const entry = container.children[index];
            Object.entries(edu).forEach(([field, value]) => {
                const input = entry.querySelector(`[data-field="${field}"]`);
                if (input) input.value = value || '';
            });
        });
    }

    populateExperience() {
        const container = document.getElementById('experienceContainer');
        container.innerHTML = '';
        
        // Always ensure at least one entry exists
        if (this.resumeData.experience.length === 0) {
            this.resumeData.experience.push({});
        }
        
        this.resumeData.experience.forEach((exp, index) => {
            this.addExperienceEntry(index);
            const entry = container.children[index];
            Object.entries(exp).forEach(([field, value]) => {
                const input = entry.querySelector(`[data-field="${field}"]`);
                if (input) input.value = value || '';
            });
        });
    }

    populateProjects() {
        const container = document.getElementById('projectsContainer');
        container.innerHTML = '';
        
        // Always ensure at least one entry exists
        if (this.resumeData.projects.length === 0) {
            this.resumeData.projects.push({});
        }
        
        this.resumeData.projects.forEach((proj, index) => {
            this.addProjectEntry(index);
            const entry = container.children[index];
            Object.entries(proj).forEach(([field, value]) => {
                const input = entry.querySelector(`[data-field="${field}"]`);
                if (input) input.value = value || '';
            });
        });
    }

    populateAchievements() {
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = '';
        
        // Always ensure at least one entry exists
        if (this.resumeData.achievements.length === 0) {
            this.resumeData.achievements.push({});
        }
        
        this.resumeData.achievements.forEach((ach, index) => {
            this.addAchievementEntry(index);
            const entry = container.children[index];
            Object.entries(ach).forEach(([field, value]) => {
                const input = entry.querySelector(`[data-field="${field}"]`);
                if (input) input.value = value || '';
            });
        });
    }

    newResume() {
        if (confirm('Are you sure? This will clear all your current data.')) {
            // Reset all data
            this.resumeData = {
                personal: {},
                education: [],
                experience: [],
                skills: [],
                projects: [],
                achievements: []
            };
            
            // Clear form fields
            const personalInputs = ['fullName', 'email', 'phone', 'location', 'linkedin', 'github', 'summary'];
            personalInputs.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = '';
            });
            
            // Clear skills
            document.getElementById('skillsInput').value = '';
            this.resumeData.skills = [];
            this.renderSkillsTags();
            
            // Clear containers
            document.getElementById('educationContainer').innerHTML = '';
            document.getElementById('experienceContainer').innerHTML = '';
            document.getElementById('projectsContainer').innerHTML = '';
            document.getElementById('achievementsContainer').innerHTML = '';
            
            // Remove from localStorage
            localStorage.removeItem('resumeData');
            
            // Re-initialize with single entry
            this.addEducation();
            this.addExperience();
            this.addProject();
            this.addAchievement();
            
            // Update preview
            this.updatePreview();
        }
    }

    clearSummary() {
        document.getElementById('summary').value = '';
        this.resumeData.personal.summary = '';
        this.updatePreview();
    }

    clearEducation() {
        this.resumeData.education = [{}]; // Keep one empty entry
        document.getElementById('educationContainer').innerHTML = '';
        this.addEducationEntry(0);
        this.updatePreview();
    }

    clearExperience() {
        this.resumeData.experience = [{}]; // Keep one empty entry
        document.getElementById('experienceContainer').innerHTML = '';
        this.addExperienceEntry(0);
        this.updatePreview();
    }

    clearProjects() {
        this.resumeData.projects = [{}]; // Keep one empty entry
        document.getElementById('projectsContainer').innerHTML = '';
        this.addProjectEntry(0);
        this.updatePreview();
    }

    clearAchievements() {
        this.resumeData.achievements = [{}]; // Keep one empty entry
        document.getElementById('achievementsContainer').innerHTML = '';
        this.addAchievementEntry(0);
        this.updatePreview();
    }
}

// Initialize the app
const resumeBuilder = new ResumeBuilder();

// Landing page navigation
function showTool() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('toolPage').style.display = 'block';
    document.body.classList.add('tool-mode');
}

function showLanding() {
    document.getElementById('landingPage').style.display = 'block';
    document.getElementById('toolPage').style.display = 'none';
    document.body.classList.remove('tool-mode');
}

// Enhanced form interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth transitions
    document.body.style.transition = 'all 0.3s ease';
    
    // Enhanced input focus effects
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
});