/**
 * ============================================================================
 * VLSM Tutor — Core Application Logic (app.js)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentLessonIndex = 0;
    let currentQuizIndex = 0;
    let quizScore = 0;
    let selectedQuizOption = null;
    let lastCalculatedResults = null;

    const defaultSubnets = [
        { name: 'Department A', hosts: 50 },
        { name: 'Department B', hosts: 25 },
        { name: 'Department C', hosts: 10 },
        { name: 'Department D', hosts: 5 }
    ];

    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const currentViewTitle = document.getElementById('currentViewTitle');

    const vlsmForm = document.getElementById('vlsmForm');
    const baseNetworkInput = document.getElementById('baseNetwork');
    const subnetsContainer = document.getElementById('subnetsContainer');
    const addSubnetRowBtn = document.getElementById('addSubnetRowBtn');
    const resetBtn = document.getElementById('resetBtn');
    const calcErrorBanner = document.getElementById('calcErrorBanner');
    const calcErrorMessage = document.getElementById('calcErrorMessage');
    
    const emptyResultsState = document.getElementById('emptyResultsState');
    const resultsContent = document.getElementById('resultsContent');
    const resultsActions = document.getElementById('resultsActions');
    const subnetTableBody = document.getElementById('subnetTableBody');
    const mBaseNet = document.getElementById('mBaseNet');
    const mSubnetCount = document.getElementById('mSubnetCount');
    const mEfficiency = document.getElementById('mEfficiency');
    const copyResultsBtn = document.getElementById('copyResultsBtn');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const quickSampleBtn = document.getElementById('quickSampleBtn');
    const loadThisSampleBtn = document.getElementById('loadThisSampleBtn');

    const lessonLinks = document.querySelectorAll('.lesson-link');
    const lessonContentContainer = document.getElementById('lessonContentContainer');

    const quizQuestionTitle = document.getElementById('quizQuestionTitle');
    const quizOptionsList = document.getElementById('quizOptionsList');
    const quizExplanationBox = document.getElementById('quizExplanationBox');
    const quizExplanationText = document.getElementById('quizExplanationText');
    const quizNextBtn = document.getElementById('quizNextBtn');
    const quizQuestionBox = document.getElementById('quizQuestionBox');
    const quizResultBox = document.getElementById('quizResultBox');
    const finalScoreNumber = document.getElementById('finalScoreNumber');
    const finalScoreMessage = document.getElementById('finalScoreMessage');
    const retryQuizBtn = document.getElementById('retryQuizBtn');
    const quizProgressBadge = document.getElementById('quizProgressBadge');

    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            switchView(targetId);
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
            }
        });
    });

    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    function switchView(viewId) {
        viewSections.forEach(sec => sec.classList.remove('active'));
        const targetSection = document.getElementById(viewId);
        if (targetSection) targetSection.classList.add('active');

        const titles = {
            'calculator-view': 'VLSM Calculator',
            'sample-view': 'Sample Practice Scenario',
            'lessons-view': 'Learning Center',
            'quiz-view': 'Interactive Quiz',
            'monetization-view': 'Pro Roadmap & Features'
        };
        currentViewTitle.textContent = titles[viewId] || 'Dashboard';
    }

    function renderSubnetRows(subnets) {
        subnetsContainer.innerHTML = '';
        subnets.forEach((sub) => {
            const row = document.createElement('div');
            row.className = 'subnet-row';
            row.innerHTML = `
                <input type="text" class="subnet-name" value="${sub.name}" placeholder="Subnet Name" required>
                <input type="number" class="subnet-hosts" value="${sub.hosts}" min="1" max="100000" placeholder="Hosts" required>
                <button type="button" class="btn-icon-danger remove-row-btn" title="Remove Subnet">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            subnetsContainer.appendChild(row);
        });

        document.querySelectorAll('.remove-row-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (subnetsContainer.children.length > 1) {
                    btn.closest('.subnet-row').remove();
                } else {
                    showToast('You must keep at least one subnet requirement.', 'error');
                }
            });
        });
    }

    addSubnetRowBtn.addEventListener('click', () => {
        const count = subnetsContainer.children.length + 1;
        const row = document.createElement('div');
        row.className = 'subnet-row';
        row.innerHTML = `
            <input type="text" class="subnet-name" value="Department ${String.fromCharCode(64 + count)}" placeholder="Subnet Name" required>
            <input type="number" class="subnet-hosts" value="10" min="1" max="100000" placeholder="Hosts" required>
            <button type="button" class="btn-icon-danger remove-row-btn" title="Remove Subnet">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        subnetsContainer.appendChild(row);
        
        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            row.remove();
        });
    });

    resetBtn.addEventListener('click', () => {
        baseNetworkInput.value = '192.168.1.0/24';
        renderSubnetRows(defaultSubnets);
        calcErrorBanner.style.display = 'none';
        emptyResultsState.style.display = 'block';
        resultsContent.style.display = 'none';
        resultsActions.style.display = 'none';
        lastCalculatedResults = null;
        showToast('Calculator reset to default settings.');
    });

    function ipToInt(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    }

    function intToIp(int) {
        return [
            (int >>> 24) & 255,
            (int >>> 16) & 255,
            (int >>> 8) & 255,
            int & 255
        ].join('.');
    }

    function isValidIPv4(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(p => {
            if (p === '' || (p.length > 1 && p[0] === '0')) return false;
            const num = Number(p);
            return Number.isInteger(num) && num >= 0 && num <= 255;
        });
    }

    function prefixToMask(prefix) {
        if (prefix === 0) return 0;
        return (~((1 << (32 - prefix)) - 1)) >>> 0;
    }

    vlsmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        calcErrorBanner.style.display = 'none';

        const baseVal = baseNetworkInput.value.trim();
        const [ipPart, prefixPart] = baseVal.split('/');

        if (!ipPart || !prefixPart || !isValidIPv4(ipPart)) {
            showError('Invalid starting IPv4 network format. Use format like 192.168.1.0/24.');
            return;
        }

        const cidr = parseInt(prefixPart, 10);
        if (isNaN(cidr) || cidr < 1 || cidr > 30) {
            showError('CIDR prefix must be between /1 and /30.');
            return;
        }

        const rows = subnetsContainer.querySelectorAll('.subnet-row');
        const requirements = [];

        for (let row of rows) {
            const nameInput = row.querySelector('.subnet-name').value.trim();
            const hostsInput = parseInt(row.querySelector('.subnet-hosts').value, 10);

            if (!nameInput) {
                showError('All subnets must have a valid name.');
                return;
            }
            if (isNaN(hostsInput) || hostsInput < 1) {
                showError(`Subnet "${nameInput}" has invalid host requirement.`);
                return;
            }

            requirements.push({ name: nameInput, hosts: hostsInput });
        }

        try {
            const results = calculateVLSM(ipPart, cidr, requirements);
            displayResults(results);
            showToast('VLSM calculation completed successfully!');
        } catch (err) {
            showError(err.message);
        }
    });

    function showError(msg) {
        calcErrorMessage.textContent = msg;
        calcErrorBanner.style.display = 'flex';
        emptyResultsState.style.display = 'block';
        resultsContent.style.display = 'none';
        resultsActions.style.display = 'none';
    }

    function calculateVLSM(baseIpStr, baseCidr, requirements) {
        const baseIpInt = ipToInt(baseIpStr);
        const baseMask = prefixToMask(baseCidr);
        const networkInt = (baseIpInt & baseMask) >>> 0;
        const totalNetIPs = Math.pow(2, 32 - baseCidr);

        const sortedReqs = [...requirements].sort((a, b) => b.hosts - a.hosts);

        let currentAddress = networkInt;
        const allocatedSubnets = [];
        let totalAssignedIPs = 0;

        for (let req of sortedReqs) {
            const neededIPs = req.hosts + 2;
            let hostBits = Math.ceil(Math.log2(neededIPs));
            if (hostBits < 2) hostBits = 2;
            
            const subnetIPs = Math.pow(2, hostBits);
            const subnetCidr = 32 - hostBits;

            if (subnetCidr < baseCidr) {
                throw new Error(`Subnet "${req.name}" requires ${req.hosts} hosts (${subnetIPs} IPs, /${subnetCidr}), which exceeds the base network prefix /${baseCidr}.`);
            }

            if (currentAddress % subnetIPs !== 0) {
                currentAddress = Math.ceil(currentAddress / subnetIPs) * subnetIPs;
            }

            const netAddr = currentAddress;
            const broadcastAddr = netAddr + subnetIPs - 1;
            const endLimit = networkInt + totalNetIPs;

            if (broadcastAddr >= endLimit) {
                throw new Error(`Insufficient address space! Subnet "${req.name}" exceeds the boundary of starting network ${baseIpStr}/${baseCidr}.`);
            }

            const usableStart = subnetIPs > 2 ? netAddr + 1 : netAddr;
            const usableEnd = subnetIPs > 2 ? broadcastAddr - 1 : broadcastAddr;

            allocatedSubnets.push({
                name: req.name,
                requiredHosts: req.hosts,
                networkAddress: intToIp(netAddr),
                cidr: subnetCidr,
                subnetMask: intToIp(prefixToMask(subnetCidr)),
                totalIPs: subnetIPs,
                usableHosts: subnetIPs > 2 ? subnetIPs - 2 : subnetIPs,
                firstUsable: intToIp(usableStart),
                lastUsable: intToIp(usableEnd),
                broadcast: intToIp(broadcastAddr)
            });

            totalAssignedIPs += subnetIPs;
            currentAddress = broadcastAddr + 1;
        }

        const efficiency = ((totalAssignedIPs / totalNetIPs) * 100).toFixed(1);

        return {
            baseNetwork: `${intToIp(networkInt)}/${baseCidr}`,
            totalSubnets: allocatedSubnets.length,
            efficiency: `${efficiency}%`,
            subnets: allocatedSubnets
        };
    }

    function displayResults(data) {
        lastCalculatedResults = data;
        mBaseNet.textContent = data.baseNetwork;
        mSubnetCount.textContent = data.totalSubnets;
        mEfficiency.textContent = data.efficiency;

        subnetTableBody.innerHTML = '';
        data.subnets.forEach(sub => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(sub.name)}</td>
                <td>${sub.requiredHosts}</td>
                <td>${sub.networkAddress}/${sub.cidr}</td>
                <td>${sub.subnetMask}</td>
                <td>${sub.totalIPs}</td>
                <td>${sub.firstUsable} — ${sub.lastUsable}</td>
                <td>${sub.broadcast}</td>
            `;
            subnetTableBody.appendChild(tr);
        });

        emptyResultsState.style.display = 'none';
        resultsContent.style.display = 'block';
        resultsActions.style.display = 'flex';
    }

    copyResultsBtn.addEventListener('click', () => {
        if (!lastCalculatedResults) return;
        let text = `VLSM Subnet Allocation Report\\nBase Network: ${lastCalculatedResults.baseNetwork}\\nTotal Subnets: ${lastCalculatedResults.totalSubnets}\\nEfficiency: ${lastCalculatedResults.efficiency}\\n\\n`;
        lastCalculatedResults.subnets.forEach((s, i) => {
            text += `${i+1}. ${s.name} | ${s.networkAddress}/${s.cidr} | Mask: ${s.subnetMask} | Usable: ${s.firstUsable} - ${s.lastUsable} | Broadcast: ${s.broadcast}\\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
            showToast('Allocation report copied to clipboard!');
        });
    });

    loadSampleBtn.addEventListener('click', () => {
        baseNetworkInput.value = '192.168.1.0/24';
        renderSubnetRows(defaultSubnets);
        switchView('calculator-view');
        navItems.forEach(n => n.classList.remove('active'));
        document.querySelector('[data-target="calculator-view"]').classList.add('active');
        vlsmForm.requestSubmit();
        showToast('Sample network loaded successfully!');
    });

    quickSampleBtn.addEventListener('click', () => { loadSampleBtn.click(); });
    loadThisSampleBtn.addEventListener('click', () => { loadSampleBtn.click(); });

    const lessonsData = [
        {
            title: "1. IPv4 Address Fundamentals",
            content: `<h3>Understanding IPv4 Addressing</h3><p>An IPv4 address is a 32-bit numerical identifier assigned to every device connected to a computer network. Expressed in dotted-decimal notation.</p><div class="code-snippet">Example: 192.168.1.1</div>`
        },
        {
            title: "2. Subnet Masks & Binary",
            content: `<h3>What is a Subnet Mask?</h3><p>A subnet mask is a 32-bit number dividing an IPv4 address into a network address and a host address.</p>`
        },
        {
            title: "3. CIDR Notation Explained",
            content: `<h3>Classless Inter-Domain Routing (CIDR)</h3><p>CIDR notation simplifies subnet masks by appending a forward slash and the count of 1-bits (e.g., /24).</p>`
        },
        {
            title: "4. Network vs. Host Addresses",
            content: `<h3>Network ID vs. Usable Hosts</h3><p>The first IP is the network address and the last IP is the broadcast address. Usable IPs lie between them.</p>`
        },
        {
            title: "5. Broadcast Addresses",
            content: `<h3>Broadcast Addresses</h3><p>Used to send packets to all devices simultaneously on the subnet.</p>`
        },
        {
            title: "6. Calculating Usable Hosts",
            content: `<h3>Usable Host Formula</h3><p>Usable Hosts = (2^(32 - CIDR)) - 2</p>`
        },
        {
            title: "7. Choosing Subnet Sizes",
            content: `<h3>Matching Requirements</h3><p>Find the smallest power of 2 greater than or equal to Required Hosts + 2.</p>`
        },
        {
            title: "8. Introduction to VLSM",
            content: `<h3>Variable Length Subnet Masking</h3><p>Subnetting subnets to prevent IP address waste.</p>`
        },
        {
            title: "9. Allocation Best Practices",
            content: `<h3>Allocation Rules</h3><p>Always sort requirements from largest to smallest before allocating.</p>`
        }
    ];

    function renderLesson(index) {
        currentLessonIndex = index;
        const lesson = lessonsData[index];
        lessonContentContainer.innerHTML = `<div class="lesson-article">${lesson.content}</div>`;
        lessonLinks.forEach((link, idx) => {
            if (idx === index) link.classList.add('active');
            else link.classList.remove('active');
        });
    }

    lessonLinks.forEach((link, idx) => {
        link.addEventListener('click', () => { renderLesson(idx); });
    });
    renderLesson(0);

    const quizQuestions = [
        { q: "How many usable host addresses are available in a /26 subnet?", options: ["62 hosts", "64 hosts", "30 hosts", "126 hosts"], correct: 0, explanation: "A /26 has 6 host bits (64 total IPs - 2 = 62 usable hosts)." },
        { q: "What is the primary advantage of VLSM?", options: ["Increases router speed", "Eliminates IP address waste by using varying subnet sizes", "Removes gateway routers", "Automatically assigns IPs"], correct: 1, explanation: "VLSM matches subnet block sizes precisely to department host counts." },
        { q: "In what order should subnet requirements be allocated?", options: ["Smallest to largest", "Alphabetical order", "Largest to smallest", "Random order"], correct: 2, explanation: "Always allocate largest to smallest to ensure correct boundary alignment." },
        { q: "What is the subnet mask for a /28 CIDR prefix?", options: ["255.255.255.0", "255.255.255.192", "255.255.255.240", "255.255.255.248"], correct: 2, explanation: "A /28 has 4 host bits yielding 255.255.255.240." },
        { q: "Which IP address in a subnet cannot be assigned to a host?", options: ["First usable IP", "Middle IP", "Network ID and Broadcast Address", "Odd IP"], correct: 2, explanation: "Network ID and Broadcast Address are reserved." },
        { q: "If a department requires 25 hosts, what is the smallest suitable subnet?", options: ["/24", "/26", "/27", "/28"], correct: 2, explanation: "27 IPs needed -> 32 IP block -> /27." },
        { q: "What is the broadcast address for 192.168.1.64/27?", options: ["192.168.1.95", "192.168.1.127", "192.168.1.63", "192.168.1.128"], correct: 0, explanation: "A /27 spanning from 64 ends at 95." },
        { q: "How many total IP addresses are in a /24 network?", options: ["128", "256", "512", "1024"], correct: 1, explanation: "2^8 = 256 total IPs." },
        { q: "What does CIDR stand for?", options: ["Computer Inter-Domain Routing", "Classless Inter-Domain Routing", "Core Internet Data Resolution", "Custom IP Domain Routing"], correct: 1, explanation: "Classless Inter-Domain Routing." },
        { q: "If your base network is 10.0.0.0/16, which is a valid subnet?", options: ["10.1.0.0/24", "10.0.128.0/18", "192.168.1.0/24", "10.128.0.0/15"], correct: 1, explanation: "10.0.128.0/18 falls inside 10.0.0.0/16." }
    ];

    function loadQuizQuestion() {
        const q = quizQuestions[currentQuizIndex];
        quizProgressBadge.textContent = `Question ${currentQuizIndex + 1} of ${quizQuestions.length}`;
        quizQuestionTitle.textContent = q.q;
        quizOptionsList.innerHTML = '';
        quizExplanationBox.style.display = 'none';
        selectedQuizOption = null;
        quizNextBtn.disabled = true;

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => selectQuizOption(idx));
            quizOptionsList.appendChild(btn);
        });
    }

    function selectQuizOption(selectedIndex) {
        if (selectedQuizOption !== null) return;
        selectedQuizOption = selectedIndex;
        const q = quizQuestions[currentQuizIndex];
        const optionButtons = quizOptionsList.querySelectorAll('.quiz-option-btn');

        optionButtons.forEach((b, idx) => {
            b.disabled = true;
            if (idx === q.correct) b.classList.add('correct');
            else if (idx === selectedIndex) b.classList.add('incorrect');
        });

        if (selectedIndex === q.correct) quizScore++;

        quizExplanationText.textContent = q.explanation;
        quizExplanationBox.style.display = 'block';
        quizNextBtn.disabled = false;
    }

    quizNextBtn.addEventListener('click', () => {
        currentQuizIndex++;
        if (currentQuizIndex < quizQuestions.length) {
            loadQuizQuestion();
        } else {
            showQuizResults();
        }
    });

    function showQuizResults() {
        quizQuestionBox.style.display = 'none';
        finalScoreNumber.textContent = `${quizScore}/${quizQuestions.length}`;
        finalScoreMessage.textContent = quizScore >= 7 ? "Fantastic job! You've mastered VLSM." : "Good effort! Review the lessons and try again.";
        quizResultBox.style.display = 'block';
    }

    retryQuizBtn.addEventListener('click', () => {
        currentQuizIndex = 0;
        quizScore = 0;
        quizResultBox.style.display = 'none';
        quizQuestionBox.style.display = 'block';
        loadQuizQuestion();
    });

    loadQuizQuestion();

    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toastNotification.style.borderColor = type === 'error' ? 'var(--danger)' : 'var(--success)';
        toastNotification.querySelector('i').className = type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check';
        toastNotification.querySelector('i').style.color = type === 'error' ? 'var(--danger)' : 'var(--success)';
        toastNotification.classList.add('show');
        setTimeout(() => { toastNotification.classList.remove('show'); }, 3000);
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    renderSubnetRows(defaultSubnets);
});