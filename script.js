document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const optionCards = document.querySelectorAll('.option-card');
    const primaryChoiceDisplay = document.getElementById('primary-choice');
    const secondaryChoiceDisplay = document.getElementById('secondary-choice');
    const voterNameInput = document.getElementById('voter-name');
    const colorPicker = document.getElementById('color-picker');
    const primaryReasonTextarea = document.getElementById('primary-reason');
    const secondaryReasonTextarea = document.getElementById('secondary-reason');
    const submitButton = document.getElementById('submit-vote');
    const teamVotesContainer = document.getElementById('team-votes-container');
    const resultsChartContainer = document.getElementById('results-chart-container');
    const votingVisualization = document.getElementById('voting-activity-visualization');
    const successModal = document.getElementById('success-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal, .close-button');
    const summaryPrimary = document.getElementById('summary-primary');
    const summarySecondary = document.getElementById('summary-secondary');

    // Add mobile menu toggle
    const body = document.body;
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    body.appendChild(menuToggle);
    
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            e.target !== menuToggle && 
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // State
    let primaryChoice = null;
    let secondaryChoice = null;
    let votes = [];
    let voteCounts = {
        'Homeland': 0,
        'Sonosupa': 0,
        'Solus Ultra': 0,
        'Subtace': 0,
        'Aux&Free': 0
    };
    
    // Initialize futuristic visualization
    initializeVisualization();

    // Try to load votes from localStorage
    try {
        const savedVotes = localStorage.getItem('eventNameVotes');
        if (savedVotes) {
            votes = JSON.parse(savedVotes);
            calculateVoteCounts();
            updateVotePercentages();
            renderTeamVotes();
            renderResultsChart();
            updateVisualization();
        } else {
            renderResultsChart(); // Initialize empty chart
        }
    } catch (error) {
        console.error('Error loading saved votes:', error);
        renderResultsChart(); // Initialize empty chart
    }

    // Event Listeners
    optionCards.forEach(card => {
        const primaryBtn = card.querySelector('.vote-primary');
        const secondaryBtn = card.querySelector('.vote-secondary');
        
        primaryBtn.addEventListener('click', () => {
            const name = card.dataset.name;
            selectPrimaryChoice(name, card, primaryBtn);
            addVisualizationPulse(name, 'primary');
        });
        
        secondaryBtn.addEventListener('click', () => {
            const name = card.dataset.name;
            selectSecondaryChoice(name, card, secondaryBtn);
            addVisualizationPulse(name, 'secondary');
        });
    });

    submitButton.addEventListener('click', submitVote);
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
    });

    // When clicking outside the modal, close it
    window.addEventListener('click', (event) => {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Enhanced Reset Poll Function
    function resetPoll() {
        console.log('Attempting to reset the poll.');
        const password = prompt('Enter password to reset the poll:');
        if (password === 'lasers1024') {
            console.log('Correct password entered. Resetting poll.');
            localStorage.removeItem('eventNameVotes');
            console.log('Local storage cleared.');
            Object.keys(voteCounts).forEach(key => {
                voteCounts[key] = 0;
            });
            console.log('Vote counts reset.');
            updateVotePercentages();
            renderResultsChart();
            renderTeamVotes();
            resetForm();
            console.log('UI updated to reflect reset state.');
            alert('Poll has been reset.');
        } else {
            console.log('Incorrect password entered. Reset aborted.');
            alert('Incorrect password.');
        }
    }

    // Add event listener to reset button
    document.getElementById('reset-poll').addEventListener('click', resetPoll);

    // Functions
    function selectPrimaryChoice(name, card, button) {
        // Reset previous selection
        if (primaryChoice) {
            const prevCard = document.querySelector(`.option-card[data-name="${primaryChoice}"]`);
            if (prevCard) {
                prevCard.classList.remove('selected-primary');
                const prevBtn = prevCard.querySelector('.vote-primary');
                prevBtn.classList.remove('selected');
                prevBtn.textContent = 'Vote as Primary';
            }
        }
        
        // Set new selection
        primaryChoice = name;
        card.classList.add('selected-primary');
        button.classList.add('selected');
        button.textContent = 'Selected as Primary';
        primaryChoiceDisplay.textContent = name;
        primaryChoiceDisplay.classList.add('selected');
        
        // If this was the secondary choice, clear that selection
        if (name === secondaryChoice) {
            clearSecondaryChoice();
        }
        
        // Add pulse animation
        primaryChoiceDisplay.classList.add('pulse');
        setTimeout(() => {
            primaryChoiceDisplay.classList.remove('pulse');
        }, 1000);
    }
    
    function selectSecondaryChoice(name, card, button) {
        // Don't allow same as primary
        if (name === primaryChoice) {
            showToast('You cannot select the same option as both primary and secondary');
            return;
        }
        
        // Reset previous selection
        if (secondaryChoice) {
            const prevCard = document.querySelector(`.option-card[data-name="${secondaryChoice}"]`);
            if (prevCard) {
                prevCard.classList.remove('selected-secondary');
                const prevBtn = prevCard.querySelector('.vote-secondary');
                prevBtn.classList.remove('selected');
                prevBtn.textContent = 'Vote as Secondary';
            }
        }
        
        // Set new selection
        secondaryChoice = name;
        card.classList.add('selected-secondary');
        button.classList.add('selected');
        button.textContent = 'Selected as Secondary';
        secondaryChoiceDisplay.textContent = name;
        secondaryChoiceDisplay.classList.add('selected');
        
        // Add pulse animation
        secondaryChoiceDisplay.classList.add('pulse');
        setTimeout(() => {
            secondaryChoiceDisplay.classList.remove('pulse');
        }, 1000);
    }
    
    function clearSecondaryChoice() {
        if (secondaryChoice) {
            const prevCard = document.querySelector(`.option-card[data-name="${secondaryChoice}"]`);
            if (prevCard) {
                prevCard.classList.remove('selected-secondary');
                const prevBtn = prevCard.querySelector('.vote-secondary');
                prevBtn.classList.remove('selected');
                prevBtn.textContent = 'Vote as Secondary';
            }
        }
        
        secondaryChoice = null;
        secondaryChoiceDisplay.textContent = 'Not selected yet';
        secondaryChoiceDisplay.classList.remove('selected');
        secondaryReasonTextarea.value = '';
    }
    
    function submitVote() {
        // Validate inputs
        const voterName = voterNameInput.value.trim();
        const userColor = colorPicker.value;
        const primaryReason = primaryReasonTextarea.value.trim();
        const secondaryReason = secondaryReasonTextarea.value.trim();
        
        if (!voterName) {
            showToast('Please enter your name');
            return;
        }
        
        if (!primaryChoice) {
            showToast('Please select a primary choice');
            return;
        }
        
        if (!primaryReason) {
            showToast('Please explain why you chose your primary option');
            return;
        }
        
        if (secondaryChoice && !secondaryReason) {
            showToast('Please explain why you chose your secondary option');
            return;
        }
        
        // Create vote object
        const vote = {
            id: Date.now(),
            name: voterName,
            color: userColor,
            primary: {
                choice: primaryChoice,
                reason: primaryReason
            },
            secondary: secondaryChoice ? {
                choice: secondaryChoice,
                reason: secondaryReason
            } : null,
            timestamp: new Date().toISOString()
        };
        
        // Add to votes array
        votes.push(vote);
        
        // Update vote counts
        calculateVoteCounts();
        
        // Save to localStorage
        try {
            localStorage.setItem('eventNameVotes', JSON.stringify(votes));
        } catch (error) {
            console.error('Error saving votes:', error);
        }
        
        // Update UI
        updateVotePercentages();
        renderTeamVotes();
        renderResultsChart();
        updateVisualization();
        
        // Add vote visualization effect
        addVoteEffect(primaryChoice, userColor, 'primary');
        if (secondaryChoice) {
            addVoteEffect(secondaryChoice, userColor, 'secondary');
        }
        
        // Show success modal
        summaryPrimary.textContent = primaryChoice;
        summarySecondary.textContent = secondaryChoice || 'None';
        successModal.style.display = 'flex';
        
        // Reset form
        resetForm();
    }
    
    function resetForm() {
        voterNameInput.value = '';
        primaryChoiceDisplay.textContent = 'Not selected yet';
        primaryChoiceDisplay.classList.remove('selected');
        secondaryChoiceDisplay.textContent = 'Not selected yet';
        secondaryChoiceDisplay.classList.remove('selected');
        primaryReasonTextarea.value = '';
        secondaryReasonTextarea.value = '';
        
        // Reset option cards
        optionCards.forEach(card => {
            card.classList.remove('selected-primary', 'selected-secondary');
            const primaryBtn = card.querySelector('.vote-primary');
            const secondaryBtn = card.querySelector('.vote-secondary');
            primaryBtn.classList.remove('selected');
            secondaryBtn.classList.remove('selected');
            primaryBtn.textContent = 'Vote as Primary';
            secondaryBtn.textContent = 'Vote as Secondary';
        });
        
        primaryChoice = null;
        secondaryChoice = null;
    }
    
    function calculateVoteCounts() {
        // Reset vote counts
        Object.keys(voteCounts).forEach(key => {
            voteCounts[key] = 0;
        });
        
        // Count primary and secondary votes
        votes.forEach(vote => {
            // Count primary votes (weight: 2)
            if (voteCounts.hasOwnProperty(vote.primary.choice)) {
                voteCounts[vote.primary.choice] += 2;
            }
            
            // Count secondary votes (weight: 1)
            if (vote.secondary && voteCounts.hasOwnProperty(vote.secondary.choice)) {
                voteCounts[vote.secondary.choice] += 1;
            }
        });
    }
    
    function updateVotePercentages() {
        const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
        
        optionCards.forEach(card => {
            const name = card.dataset.name;
            const percentageElement = card.querySelector('.vote-percentage');
            const voteCount = voteCounts[name] || 0; // Ensure voteCount is defined
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            percentageElement.textContent = `${percentage}%`;
            
            // Animate percentage change
            percentageElement.classList.add('pulse');
            setTimeout(() => {
                percentageElement.classList.remove('pulse');
            }, 1000);
        });
    }
    
    function renderTeamVotes() {
        if (votes.length === 0) {
            teamVotesContainer.innerHTML = '<div class="empty-votes-message">No votes submitted yet. Be the first to vote!</div>';
            return;
        }
        
        teamVotesContainer.innerHTML = '';
        
        // Sort votes by timestamp (newest first)
        const sortedVotes = [...votes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        sortedVotes.forEach(vote => {
            const initials = getInitials(vote.name);
            
            const voteCard = document.createElement('div');
            voteCard.className = 'vote-card fade-in';
            voteCard.style.borderLeftColor = vote.color;
            
            voteCard.innerHTML = `
                <div class="voter-info">
                    <div class="voter-avatar" style="background-color: ${vote.color}">
                        ${initials}
                    </div>
                    <div class="voter-name">${vote.name}</div>
                </div>
                <div class="vote-details">
                    <div class="vote-choice">
                        <div class="choice-label">Primary Choice</div>
                        <div class="choice-name">${vote.primary.choice}</div>
                        <div class="choice-reason">${vote.primary.reason}</div>
                    </div>
                    ${vote.secondary ? `
                    <div class="vote-choice">
                        <div class="choice-label">Secondary Choice</div>
                        <div class="choice-name">${vote.secondary.choice}</div>
                        <div class="choice-reason">${vote.secondary.reason}</div>
                    </div>
                    ` : ''}
                </div>
            `;
            
            teamVotesContainer.appendChild(voteCard);
        });
    }
    
    function renderResultsChart() {
        const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
        
        // Sort options by vote count (descending)
        const sortedOptions = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a]);
        
        // Create chart HTML
        let chartHTML = '<div class="chart-bar-container">';
        
        sortedOptions.forEach(option => {
            const voteCount = voteCounts[option];
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            
            chartHTML += `
                <div class="result-bar-item">
                    <div class="result-bar-header">
                        <div class="result-name">${option}</div>
                        <div class="result-percentage">${percentage}%</div>
                    </div>
                    <div class="result-bar-bg">
                        <div class="result-bar-fill" style="width: 0%;" data-percentage="${percentage}"></div>
                    </div>
                </div>
            `;
        });
        
        chartHTML += '</div>';
        
        // Update chart container
        resultsChartContainer.innerHTML = chartHTML;
        
        // Animate bars
        setTimeout(() => {
            const bars = resultsChartContainer.querySelectorAll('.result-bar-fill');
            bars.forEach(bar => {
                const percentage = bar.dataset.percentage;
                bar.style.width = `${percentage}%`;
            });
        }, 100);
    }
    
    // Futuristic Visualization Functions
    function initializeVisualization() {
        // Clear any existing content
        votingVisualization.innerHTML = '';
        
        // Create grid lines
        createGrid();
        
        // Add initial data points
        updateVisualization();
        
        // Add periodic effects
        setInterval(() => {
            addRandomPulse();
        }, 3000);
    }
    
    function createGrid() {
        // Create horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line grid-line-horizontal';
            gridLine.style.top = `${i * 20}%`;
            votingVisualization.appendChild(gridLine);
        }
        
        // Create vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line grid-line-vertical';
            gridLine.style.left = `${i * 10}%`;
            votingVisualization.appendChild(gridLine);
        }
    }
    
    function updateVisualization() {
        // Remove old data points and lines
        const oldPoints = votingVisualization.querySelectorAll('.data-point, .data-line');
        oldPoints.forEach(point => point.remove());
        
        const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
        if (totalVotes === 0) return;
        
        // Get options sorted by votes
        const sortedOptions = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a]);
        
        // Create data points
        let prevPoint = null;
        sortedOptions.forEach((option, index) => {
            const percentage = Math.round((voteCounts[option] / totalVotes) * 100);
            const x = 10 + (index * (80 / (sortedOptions.length - 1 || 1)));
            const y = 80 - (percentage * 0.7);
            
            // Create data point
            const dataPoint = document.createElement('div');
            dataPoint.className = 'data-point';
            dataPoint.style.left = `${x}%`;
            dataPoint.style.top = `${y}%`;
            dataPoint.dataset.option = option;
            dataPoint.dataset.percentage = percentage;
            votingVisualization.appendChild(dataPoint);
            
            // Create label
            const label = document.createElement('div');
            label.className = 'vote-label';
            label.textContent = `${option}: ${percentage}%`;
            label.style.left = `${x}%`;
            label.style.top = `${y}%`;
            votingVisualization.appendChild(label);
            
            // Create line connecting points
            if (prevPoint) {
                const prevX = parseFloat(prevPoint.style.left);
                const prevY = parseFloat(prevPoint.style.top);
                
                const length = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
                const angle = Math.atan2(y - prevY, x - prevX) * (180 / Math.PI);
                
                const line = document.createElement('div');
                line.className = 'data-line';
                line.style.width = `${length}%`;
                line.style.transform = `translate(${prevX}%, ${prevY}%) rotate(${angle}deg)`;
                votingVisualization.appendChild(line);
            }
            
            prevPoint = dataPoint;
        });
    }
    
    function addVoteEffect(option, color, type) {
        // Find the corresponding data point
        const dataPoints = votingVisualization.querySelectorAll('.data-point');
        let targetPoint = null;
        
        dataPoints.forEach(point => {
            if (point.dataset.option === option) {
                targetPoint = point;
            }
        });
        
        if (!targetPoint) return;
        
        // Get position
        const x = parseFloat(targetPoint.style.left);
        const y = parseFloat(targetPoint.style.top);
        
        // Create pulse circle
        const pulseCircle = document.createElement('div');
        pulseCircle.className = 'pulse-circle';
        pulseCircle.style.left = `${x}%`;
        pulseCircle.style.top = `${y}%`;
        pulseCircle.style.background = type === 'primary' 
            ? `radial-gradient(circle, ${color}80 0%, ${color}20 70%, ${color}00 100%)`
            : `radial-gradient(circle, ${color}60 0%, ${color}10 70%, ${color}00 100%)`;
        votingVisualization.appendChild(pulseCircle);
        
        // Remove after animation completes
        setTimeout(() => {
            pulseCircle.remove();
        }, 2000);
        
        // Create vote particle
        const particle = document.createElement('div');
        particle.className = 'vote-particle';
        particle.style.backgroundColor = color;
        particle.style.left = '50%';
        particle.style.top = '90%';
        votingVisualization.appendChild(particle);
        
        // Create trail
        const trail = document.createElement('div');
        trail.className = 'vote-trail';
        trail.style.left = '50%';
        trail.style.top = '90%';
        trail.style.backgroundColor = `${color}80`;
        votingVisualization.appendChild(trail);
        
        // Animate particle to target
        const duration = 1000;
        const startTime = Date.now();
        const startX = 50;
        const startY = 90;
        const targetX = x;
        const targetY = y;
        
        function animateParticle() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
            
            const currentX = startX + (targetX - startX) * easeProgress;
            const currentY = startY + (targetY - startY) * easeProgress;
            
            particle.style.left = `${currentX}%`;
            particle.style.top = `${currentY}%`;
            
            // Update trail
            const trailHeight = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
            const angle = Math.atan2(currentY - startY, currentX - startX) * (180 / Math.PI) - 90;
            
            trail.style.height = `${trailHeight}%`;
            trail.style.transform = `rotate(${angle}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animateParticle);
            } else {
                // Remove particle and trail
                setTimeout(() => {
                    particle.remove();
                    trail.remove();
                }, 100);
                
                // Update visualization
                updateVisualization();
            }
        }
        
        requestAnimationFrame(animateParticle);
    }
    
    function addVisualizationPulse(option, type) {
        // Find the corresponding data point
        const dataPoints = votingVisualization.querySelectorAll('.data-point');
        let targetPoint = null;
        
        dataPoints.forEach(point => {
            if (point.dataset.option === option) {
                targetPoint = point;
            }
        });
        
        if (!targetPoint) return;
        
        // Get position
        const x = parseFloat(targetPoint.style.left);
        const y = parseFloat(targetPoint.style.top);
        
        // Create pulse circle
        const pulseCircle = document.createElement('div');
        pulseCircle.className = 'pulse-circle';
        pulseCircle.style.left = `${x}%`;
        pulseCircle.style.top = `${y}%`;
        pulseCircle.style.background = type === 'primary' 
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(99, 102, 241, 0.1) 70%, rgba(99, 102, 241, 0) 100%)'
            : 'radial-gradient(circle, rgba(129, 140, 248, 0.6) 0%, rgba(129, 140, 248, 0.1) 70%, rgba(129, 140, 248, 0) 100%)';
        votingVisualization.appendChild(pulseCircle);
        
        // Remove after animation completes
        setTimeout(() => {
            pulseCircle.remove();
        }, 2000);
    }
    
    function addRandomPulse() {
        // Only add random pulses if we have votes
        if (Object.values(voteCounts).reduce((sum, count) => sum + count, 0) === 0) return;
        
        // Get a random option with votes
        const options = Object.keys(voteCounts).filter(option => voteCounts[option] > 0);
        if (options.length === 0) return;
        
        const randomOption = options[Math.floor(Math.random() * options.length)];
        const type = Math.random() > 0.5 ? 'primary' : 'secondary';
        
        addVisualizationPulse(randomOption, type);
    }
    
    function getInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    
    function showToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set message and show toast
        toast.textContent = message;
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
