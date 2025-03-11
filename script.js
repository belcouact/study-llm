// Global function to display the current question
function displayCurrentQuestion() {
    console.log('displayCurrentQuestion called', window.currentQuestionIndex);
    const question = window.questions[window.currentQuestionIndex];
    
    if (!question) {
        console.error('No question found at index', window.currentQuestionIndex);
        return;
    }
    
    // Update question counter
    const questionCounter = document.getElementById('question-counter');
    if (questionCounter) {
        questionCounter.textContent = `题目 ${window.currentQuestionIndex + 1} / ${window.questions.length}`;
    }
    
    // Display question text and choices
    const questionText = document.getElementById('question-text');
    const choiceAText = document.getElementById('choice-a-text');
    const choiceBText = document.getElementById('choice-b-text');
    const choiceCText = document.getElementById('choice-c-text');
    const choiceDText = document.getElementById('choice-d-text');
    
    if (questionText) questionText.textContent = question.questionText;
    if (choiceAText) choiceAText.textContent = question.choices.A;
    if (choiceBText) choiceBText.textContent = question.choices.B;
    if (choiceCText) choiceCText.textContent = question.choices.C;
    if (choiceDText) choiceDText.textContent = question.choices.D;
    
    // Clear any selected radio buttons
    document.querySelectorAll('input[name="choice"]').forEach(radio => {
        radio.checked = false;
    });
    
    // If user has already answered this question, select their answer
    if (window.userAnswers && window.userAnswers[window.currentQuestionIndex]) {
        const answerRadio = document.getElementById(`choice-${window.userAnswers[window.currentQuestionIndex].toLowerCase()}`);
        if (answerRadio) {
            answerRadio.checked = true;
        }
        
        // Show the answer container if already answered
        const answerContainer = document.getElementById('answer-container');
        if (answerContainer) {
            answerContainer.classList.remove('hidden');
        }
        
        // Display result
        const selectedAnswer = window.userAnswers[window.currentQuestionIndex];
        const correctAnswer = question.answer;
        const answerResult = document.getElementById('answer-result');
        
        if (answerResult) {
            if (selectedAnswer === correctAnswer) {
                answerResult.textContent = `✓ 正确！答案是：${correctAnswer}`;
                answerResult.style.color = '#28a745';
            } else {
                answerResult.textContent = `✗ 错误。正确答案是：${correctAnswer}`;
                answerResult.style.color = '#dc3545';
            }
        }
        
        // Display explanation
        const answerExplanation = document.getElementById('answer-explanation');
        if (answerExplanation) {
            answerExplanation.textContent = question.explanation;
        }
    } else {
        // Hide the answer container if not answered
        const answerContainer = document.getElementById('answer-container');
        if (answerContainer) {
            answerContainer.classList.add('hidden');
        }
    }
}

// Global function to update navigation buttons
function updateNavigationButtons() {
    console.log('updateNavigationButtons called', window.currentQuestionIndex, window.questions ? window.questions.length : 0);
    
    const prevButton = document.getElementById('prev-question-button');
    const nextButton = document.getElementById('next-question-button');
    
    if (prevButton) {
        prevButton.disabled = !window.questions || window.currentQuestionIndex <= 0;
    }
    
    if (nextButton) {
        nextButton.disabled = !window.questions || window.currentQuestionIndex >= window.questions.length - 1;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Debug all clicks
    document.addEventListener('click', (e) => {
        console.log('Element clicked:', e.target);
        if (e.target.id === 'generate-questions-button') {
            console.log('Generate questions button clicked via document listener');
        }
    });
    
    // Core elements that definitely exist
    const userInput = document.getElementById('user-input');
    const submitButton = document.getElementById('submit-button');
    const optimizeButton = document.getElementById('optimize-button');
    const output = document.getElementById('output');
    const loading = document.getElementById('loading');
    
    // Panel navigation elements
    const qaButton = document.getElementById('qa-button');
    const createButton = document.getElementById('create-button');
    const qaContainer = document.getElementById('qa-container');
    const createContainer = document.getElementById('create-container');
    
    // Question form elements
    const questionFormContainer = document.getElementById('question-form-container');
    const questionForm = document.getElementById('question-form');
    const schoolSelect = document.getElementById('school-select');
    const gradeSelect = document.getElementById('grade-select');
    const subjectSelect = document.getElementById('subject-select');
    const generateQuestionsButton = document.getElementById('generate-questions-button');
    
    // Question display elements
    const questionsDisplayContainer = document.getElementById('questions-display-container');
    const questionCounter = document.getElementById('question-counter');
    const questionText = document.getElementById('question-text');
    const choiceAText = document.getElementById('choice-a-text');
    const choiceBText = document.getElementById('choice-b-text');
    const choiceCText = document.getElementById('choice-c-text');
    const choiceDText = document.getElementById('choice-d-text');
    const submitAnswerButton = document.getElementById('submit-answer-button');
    const answerContainer = document.getElementById('answer-container');
    const answerResult = document.getElementById('answer-result');
    const answerExplanation = document.getElementById('answer-explanation');
    const prevQuestionButton = document.getElementById('prev-question-button');
    const nextQuestionButton = document.getElementById('next-question-button');
    const choiceRadios = document.querySelectorAll('input[name="choice"]');
    
    // Sidebar elements
    const leftPanel = document.querySelector('.left-panel');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const contentArea = document.querySelector('.content-area');
    
    // Optional elements - may not exist in all versions of the HTML
    const directTestButton = document.getElementById('direct-test-button');
    const simpleApiButton = document.getElementById('simple-api-button');
    const checkEnvButton = document.getElementById('check-env-button');
    const apiFunctionRadios = document.querySelectorAll('input[name="api-function"]');
    const fallbackButton = document.getElementById('fallback-button');
    const modelSelect = document.getElementById('model-select');

    let currentApiFunction = 'chat'; // Updated to use the Cloudflare Pages function
    let lastQuestion = null;
    let currentModel = 'deepseek-r1';
    
    // Question set variables
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];

    // API configuration
    // Note: These values are now for reference only and not actually used for API calls
    // The actual values are stored in Cloudflare Pages environment variables
    const API_BASE_URL = 'https://api.lkeap.cloud.tencent.com/v1';
    const MODEL = 'deepseek-r1';

    // Sidebar toggle functionality
    sidebarToggle.addEventListener('click', () => {
        leftPanel.classList.toggle('hidden');
        contentArea.classList.toggle('full-width');
        sidebarToggle.classList.toggle('collapsed');
        
        // Save sidebar state to localStorage
        const isSidebarHidden = leftPanel.classList.contains('hidden');
        localStorage.setItem('sidebarHidden', isSidebarHidden);
    });
    
    // Load saved sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarHidden');
    if (savedSidebarState === 'true') {
        leftPanel.classList.add('hidden');
        contentArea.classList.add('full-width');
        sidebarToggle.classList.add('collapsed');
    }

    // Add event listener for the submit button
    submitButton.addEventListener('click', handleSubmit);
    
    // Add event listener for the optimize button
    optimizeButton.addEventListener('click', optimizeQuestion);
    
    // Add event listeners for panel navigation
    qaButton.addEventListener('click', () => {
        // Show Q&A container, hide Create container
        qaContainer.classList.remove('hidden');
        createContainer.classList.add('hidden');
        
        // Update active button
        qaButton.classList.add('active');
        createButton.classList.remove('active');
    });
    
    createButton.addEventListener('click', () => {
        // Show Create container, hide Q&A container
        createContainer.classList.remove('hidden');
        qaContainer.classList.add('hidden');
        
        // Update active button
        createButton.classList.add('active');
        qaButton.classList.remove('active');
        
        // Initialize the dropdowns when switching to create mode
        populateGradeOptions(schoolSelect.value);
        populateSubjectOptions(schoolSelect.value);
    });
    
    // School select change event
    if (schoolSelect) {
        schoolSelect.addEventListener('change', () => {
            populateGradeOptions(schoolSelect.value);
            populateSubjectOptions(schoolSelect.value);
        });
    }
    
    // Generate Questions button click event
    if (generateQuestionsButton) {
        console.log('Found generate questions button:', generateQuestionsButton);
        
        generateQuestionsButton.addEventListener('click', handleGenerateQuestionsClick);
    } else {
        console.error('Generate questions button not found');
    }
    
    // Add event listeners for navigation and submit buttons
    if (submitAnswerButton) {
        submitAnswerButton.addEventListener('click', function() {
            console.log('Submit answer button clicked');
            
            // Get the selected answer
            const selectedAnswer = document.querySelector('input[name="choice"]:checked');
            
            if (!selectedAnswer) {
                alert('请选择一个答案');
                return;
            }
            
            // Save the user's answer
            window.userAnswers[window.currentQuestionIndex] = selectedAnswer.value;
            
            // Get the correct answer
            const correctAnswer = window.questions[window.currentQuestionIndex].answer;
            
            // Show the answer container
            document.getElementById('answer-container').classList.remove('hidden');
            
            // Display result
            const answerResult = document.getElementById('answer-result');
            if (selectedAnswer.value === correctAnswer) {
                answerResult.textContent = `✓ 正确！答案是：${correctAnswer}`;
                answerResult.style.color = '#28a745';
            } else {
                answerResult.textContent = `✗ 错误。正确答案是：${correctAnswer}`;
                answerResult.style.color = '#dc3545';
            }
            
            // Display explanation
            document.getElementById('answer-explanation').textContent = window.questions[window.currentQuestionIndex].explanation;
            
            // Enable navigation buttons
            updateNavigationButtons();
        });
    }
    
    if (prevQuestionButton) {
        prevQuestionButton.addEventListener('click', function() {
            console.log('Previous question button clicked');
            if (window.currentQuestionIndex > 0) {
                window.currentQuestionIndex--;
                displayCurrentQuestion();
                updateNavigationButtons();
            }
        });
    }
    
    if (nextQuestionButton) {
        nextQuestionButton.addEventListener('click', function() {
            console.log('Next question button clicked');
            if (window.currentQuestionIndex < window.questions.length - 1) {
                window.currentQuestionIndex++;
                displayCurrentQuestion();
                updateNavigationButtons();
            }
        });
    }
    
    // Function to parse questions from API response
    function parseQuestionsFromResponse(response) {
        console.log('Parsing questions from response:', response);
        
        // Extract content from the API response
        const content = extractContentFromResponse(response);
        if (!content) {
            console.error('No content found in response');
            return [];
        }
        
        console.log('Extracted content:', content);
        const parsedQuestions = [];
        
        // Split the content by "题目："
        const questionBlocks = content.split(/题目：/).filter(block => block.trim());
        console.log(`Found ${questionBlocks.length} question blocks`);
        
        for (const block of questionBlocks) {
            try {
                // Extract question text
                const questionText = block.split(/[A-D]\.|\n答案：|\n解析：/)[0].trim();
                
                // Extract choices
                const choiceA = block.match(/A\.(.*?)(?=B\.|$)/s)?.[1]?.trim() || '';
                const choiceB = block.match(/B\.(.*?)(?=C\.|$)/s)?.[1]?.trim() || '';
                const choiceC = block.match(/C\.(.*?)(?=D\.|$)/s)?.[1]?.trim() || '';
                const choiceD = block.match(/D\.(.*?)(?=\n答案：|$)/s)?.[1]?.trim() || '';
                
                // Extract answer
                const answer = block.match(/答案：([A-D])/)?.[1] || '';
                
                // Extract explanation
                const explanation = block.match(/解析：([\s\S]*?)(?=题目：|$)/)?.[1]?.trim() || '';
                
                if (!questionText || !answer) {
                    console.warn('Skipping question with missing text or answer');
                    continue;
                }
                
                parsedQuestions.push({
                    questionText: `题目：${questionText}`,
                    choices: {
                        A: choiceA,
                        B: choiceB,
                        C: choiceC,
                        D: choiceD
                    },
                    answer,
                    explanation
                });
            } catch (error) {
                console.error('Error parsing question block:', error, block);
            }
        }
        
        console.log(`Successfully parsed ${parsedQuestions.length} questions`);
        return parsedQuestions;
    }
    
    // Function to populate grade options based on selected school
    function populateGradeOptions(school) {
        // Clear existing options
        gradeSelect.innerHTML = '';
        
        let options = [];
        
        // Set options based on school
        switch (school) {
            case '小学':
                options = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
                break;
            case '初中':
                options = ['初一', '初二', '初三'];
                break;
            case '高中':
                options = ['高一', '高二', '高三'];
                break;
            case '大学':
                options = ['大一', '大二', '大三', '大四'];
                break;
            default:
                options = ['请先选择学校'];
        }
        
        // Add options to select
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            gradeSelect.appendChild(optionElement);
        });
    }
    
    // Function to populate subject options based on selected school
    function populateSubjectOptions(school) {
        // Clear existing options
        subjectSelect.innerHTML = '';
        
        let options = [];
        
        // Set options based on school
        switch (school) {
            case '小学':
                options = ['语文', '数学', '英语', '科学', '道德与法治'];
                break;
            case '初中':
                options = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
                break;
            case '高中':
                options = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
                break;
            case '大学':
                options = ['高等数学', '大学物理', '线性代数', '概率论', '英语', '计算机科学', '经济学', '管理学'];
                break;
            default:
                options = ['请先选择学校'];
        }
        
        // Add options to select
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            subjectSelect.appendChild(optionElement);
        });
    }

    // Add event listener for the direct test button (if it exists)
    if (directTestButton) {
        directTestButton.addEventListener('click', async () => {
            try {
                // Show loading state
                loading.classList.remove('hidden');
                
                const response = await fetch('/api/direct-test');
                const data = await response.json();
                
                // Hide loading state
                loading.classList.add('hidden');
                
                // Removed diagnostics code
                
                console.log('Direct API test completed:', data);
            } catch (error) {
                // Hide loading state
                loading.classList.add('hidden');
                
                console.error('Direct API test failed:', error);
            }
        });
    }

    // Add event listener for the check environment button (if it exists)
    if (checkEnvButton) {
        checkEnvButton.addEventListener('click', async () => {
            try {
                // Show loading state
                loading.classList.remove('hidden');
                
                const response = await fetch('/api/check-env');
                const data = await response.json();
                
                // Hide loading state
                loading.classList.add('hidden');
                
                // Removed diagnostics code
                
                if (data.status === 'ok') {
                    console.log('Environment check completed:', data);
                } else {
                    console.error('Environment check failed:', data);
                }
            } catch (error) {
                // Hide loading state
                loading.classList.add('hidden');
                
                console.error('Environment check failed:', error);
            }
        });
    }

    // Add event listeners for optional elements only if they exist
    if (simpleApiButton) {
        simpleApiButton.addEventListener('click', async () => {
            const question = userInput.value.trim() || "Hello, how are you?";
            
            if (!question) {
                alert('Please enter a question first.');
                return;
            }
            
            try {
                // Show loading state
                loading.classList.remove('hidden');
                output.innerHTML = '';
                
                const response = await fetch('/api/simple-ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question })
                });
                
                const data = await response.json();
                console.log('Simple API response:', data);
                
                // Format and display the response
                const content = extractContentFromResponse(data);
                output.innerHTML = `<div class="ai-message">${formatResponse(content)}</div>`;
            } catch (error) {
                console.error('Simple API error:', error);
                output.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            } finally {
                // Hide loading state
                loading.classList.add('hidden');
            }
        });
    }

    // Add event listeners for API function radio buttons
    if (apiFunctionRadios && apiFunctionRadios.length > 0) {
        apiFunctionRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentApiFunction = e.target.value;
                console.log('API function changed to:', currentApiFunction);
            });
        });
    }

    // Add event listener for model select if it exists
    if (modelSelect) {
        modelSelect.addEventListener('change', () => {
            currentModel = modelSelect.value;
            console.log('Model changed to:', currentModel);
        });
    }

    // Main submit function
    async function handleSubmit() {
        const question = userInput.value.trim();
        
        if (!question) {
            showSystemMessage('Please enter a question.', 'warning');
            return;
        }
        
        try {
            // Call the AI API with the user's question
            const prompt = question;
            const response = await fetchAIResponse(prompt);
            
            // Handle the response
            handleSuccessfulResponse(response, question);
        } catch (error) {
            console.error('Error:', error);
            showSystemMessage(`Error: ${error.message}`, 'error');
        }
    }
    
    // Function to handle successful responses
    function handleSuccessfulResponse(data, question) {
        // Extract and display content
        let content = extractContentFromResponse(data);
        
        // Format the response
        const formattedContent = formatResponse(content);
        
        // Display the formatted content
        output.innerHTML = `<div class="ai-message">${formattedContent}</div>`;
        
        // Render math formulas
        if (window.MathJax && typeof window.MathJax.typeset === 'function') {
            window.MathJax.typeset();
        }
        
        // Store the last question for retry functionality
        lastQuestion = question;
    }
    
    // Function to extract content from API response
    function extractContentFromResponse(data) {
        console.log('Extracting content from response:', data);
        
        try {
            // Handle different API response formats
            if (data.choices && data.choices[0] && data.choices[0].message) {
                // OpenAI-like format
                return data.choices[0].message.content;
            } else if (data.response) {
                // Simple API format
                return data.response;
            } else if (data.content) {
                // Direct content format
                return data.content;
            } else if (typeof data === 'string') {
                // Already a string
                return data;
            } else {
                // Try to find content in the response
                const possibleContentFields = ['text', 'answer', 'result', 'output', 'generated_text'];
                for (const field of possibleContentFields) {
                    if (data[field]) {
                        return data[field];
                    }
                }
                
                // If all else fails, stringify the entire response
                console.warn('Could not extract content from response, using stringified response');
                return JSON.stringify(data);
            }
        } catch (error) {
            console.error('Error extracting content from response:', error);
            return '';
        }
    }
    
    // Function to fetch AI response for question generation
    async function fetchAIResponse(prompt) {
        console.log('Fetching AI response with prompt:', prompt);
        
        try {
            // Make API call to generate questions
            const response = await fetch('/api/simple-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: prompt })
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            console.log('AI response received:', data);
            
            return data;
        } catch (error) {
            console.error('Error fetching AI response:', error);
            throw error;
        }
    }
    
    // Function to escape HTML special characters
    function escapeHTML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // Function to format the response with proper line breaks and formatting
    function formatResponse(text) {
        if (!text) return '';
        
        // Escape HTML special characters
        let escapedText = escapeHTML(text);
        
        // Handle literal '\n' characters in the text (convert them to actual newlines)
        escapedText = escapedText.replace(/\\n/g, '\n');
        
        // Handle Chinese poetry formatting
        if (escapedText.includes('《') && escapedText.includes('》')) {
            // Split the text into lines
            const lines = escapedText.split('\n');
            let formattedPoem = '';
            
            // Process each line
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Skip empty lines
                if (!line) continue;
                
                // If it's a title line (contains 《》)
                if (line.includes('《') && line.includes('》')) {
                    formattedPoem += `<h3 class="poem-title">${line}</h3>`;
                } else {
                    // Regular poem line
                    formattedPoem += `<div class="poem-line">${line}</div>`;
                }
            }
            
            // Add poetry class for styling
            return `<div class="poetry">${formattedPoem}</div>`;
        }
        
        // Process math formulas
        escapedText = processMathFormulas(escapedText);
        
        // Detect and format code blocks
        const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
        escapedText = escapedText.replace(codeBlockRegex, function(match, language, code) {
            // Check if this is a math block
            if (language === 'math') {
                return `<div class="math-code">${code}</div>`;
            }
            return `<pre><code class="language-${language}">${code}</code></pre>`;
        });
        
        // Format tables
        escapedText = formatTables(escapedText);
        
        // Format lists with proper indentation
        escapedText = formatLists(escapedText);
        
        // Regular formatting for non-poetry text
        return escapedText
            // Handle literal '\n' characters that might still be in the text
            .replace(/\\n/g, '\n')
            // Replace double newlines with paragraph breaks
            .replace(/\n\n/g, '</p><p>')
            // Replace single newlines with line breaks
            .replace(/\n/g, '<br>')
            // Wrap in paragraphs if not already
            .replace(/^(.+)$/gm, function(match) {
                if (!match.startsWith('<p>') && !match.startsWith('<h') && 
                    !match.startsWith('<ul') && !match.startsWith('<ol') && 
                    !match.startsWith('<pre') && !match.startsWith('<blockquote') &&
                    !match.startsWith('<div class="math')) {
                    return `<p>${match}</p>`;
                }
                return match;
            })
            // Format markdown
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Highlight important information
            .replace(/!!(.*?)!!/g, '<span class="highlight">$1</span>');
    }
    
    // Function to process math formulas
    function processMathFormulas(text) {
        // Process inline math: $formula$
        text = text.replace(/\$([^\$\n]+?)\$/g, function(match, formula) {
            return `<span class="math-inline">\\(${formula}\\)</span>`;
        });
        
        // Process display math: $$formula$$
        text = text.replace(/\$\$([\s\S]+?)\$\$/g, function(match, formula) {
            return `<div class="math-display">\\[${formula}\\]</div>`;
        });
        
        return text;
    }
    
    // Function to format tables in markdown
    function formatTables(text) {
        const tableRegex = /\|(.+)\|\n\|(?:[-:]+\|)+\n((?:\|.+\|\n)+)/g;
        
        return text.replace(tableRegex, function(match, headerRow, bodyRows) {
            // Process header
            const headers = headerRow.split('|').map(cell => cell.trim()).filter(cell => cell);
            
            // Process body rows
            const rows = bodyRows.trim().split('\n');
            
            let tableHTML = '<table><thead><tr>';
            
            // Add headers
            headers.forEach(header => {
                tableHTML += `<th>${header}</th>`;
            });
            
            tableHTML += '</tr></thead><tbody>';
            
            // Add rows
            rows.forEach(row => {
                const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
                tableHTML += '<tr>';
                cells.forEach(cell => {
                    tableHTML += `<td>${cell}</td>`;
                });
                tableHTML += '</tr>';
            });
            
            tableHTML += '</tbody></table>';
            return tableHTML;
        });
    }
    
    // Function to format lists
    function formatLists(text) {
        // Process unordered lists
        let formattedText = text.replace(/^(\s*)-\s+(.+)$/gm, function(match, indent, content) {
            const indentLevel = indent.length;
            return `<ul style="margin-left: ${indentLevel * 20}px;"><li>${content}</li></ul>`;
        });
        
        // Process ordered lists
        formattedText = formattedText.replace(/^(\s*)\d+\.\s+(.+)$/gm, function(match, indent, content) {
            const indentLevel = indent.length;
            return `<ol style="margin-left: ${indentLevel * 20}px;"><li>${content}</li></ol>`;
        });
        
        // Combine adjacent list items of the same type and level
        formattedText = formattedText
            .replace(/<\/ul>\s*<ul style="margin-left: (\d+)px;">/g, '')
            .replace(/<\/ol>\s*<ol style="margin-left: (\d+)px;">/g, '');
        
        return formattedText;
    }
    
    // Function to show system messages
    function showSystemMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `system-message ${type}`;
        messageElement.textContent = message;
        
        // Clear previous messages
        const existingMessages = output.querySelectorAll('.system-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Add new message
        output.prepend(messageElement);
        
        // Auto-remove after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                messageElement.remove();
            }, 5000);
        }
    }
    
    // Function to optimize questions
    async function optimizeQuestion() {
        const question = userInput.value.trim();
        
        if (!question) {
            showSystemMessage('Please enter a question to optimize.', 'warning');
            return;
        }
        
        // Add optimizing class to button
        optimizeButton.classList.add('optimizing');
        optimizeButton.textContent = '优化中...';
        
        try {
            // In a real application, this would call an API to optimize the question
            // For now, we'll just simulate it
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simulate an optimized question
            const optimizedQuestion = `${question} (请提供详细解释和例子)`;
            
            // Update the textarea
            userInput.value = optimizedQuestion;
            
            // Show success message
            showSystemMessage('问题已优化！', 'success');
        } catch (error) {
            console.error('Error optimizing question:', error);
            showSystemMessage('优化问题时出错，请重试', 'error');
        } finally {
            // Remove optimizing class from button
            optimizeButton.classList.remove('optimizing');
            optimizeButton.textContent = '优化问题';
        }
    }
    
    // Global function to handle generate questions button click
    function handleGenerateQuestionsClick() {
        console.log('handleGenerateQuestionsClick called');
        
        // Get form elements
        const schoolSelect = document.getElementById('school-select');
        const gradeSelect = document.getElementById('grade-select');
        const semesterSelect = document.getElementById('semester-select');
        const subjectSelect = document.getElementById('subject-select');
        const difficultySelect = document.getElementById('difficulty-select');
        const questionCountSelect = document.getElementById('question-count-select');
        const questionFormContainer = document.getElementById('question-form-container');
        const questionsDisplayContainer = document.getElementById('questions-display-container');
        const loading = document.getElementById('loading');
        
        if (!schoolSelect || !gradeSelect || !semesterSelect || !subjectSelect || 
            !difficultySelect || !questionCountSelect || !questionFormContainer || 
            !questionsDisplayContainer || !loading) {
            console.error('One or more form elements not found');
            return;
        }
        
        // Show loading state
        loading.classList.remove('hidden');
        
        // Collect form data
        const schoolType = schoolSelect.value;
        const grade = gradeSelect.value;
        const semester = semesterSelect.value;
        const subject = subjectSelect.value;
        const difficulty = difficultySelect.value;
        const questionCount = questionCountSelect.value;
        
        console.log('Form data collected:', { schoolType, grade, semester, subject, difficulty, questionCount });
        
        // Create prompt for API
        const prompt = `请生成${questionCount}道${schoolType}${grade}${semester}${subject}的${difficulty}难度选择题，每道题包括题目、四个选项(A、B、C、D)、答案和详细解析。格式如下：
题目：[题目内容]
A. [选项A]
B. [选项B]
C. [选项C]
D. [选项D]
答案：[正确选项字母]
解析：[详细解析]`;

        // Call API to generate questions
        fetchAIResponse(prompt)
            .then(response => {
                try {
                    // Parse the response
                    const parsedQuestions = parseQuestionsFromResponse(response);
                    console.log('Parsed questions:', parsedQuestions);
                    
                    if (parsedQuestions.length === 0) {
                        throw new Error('No questions could be parsed from the response');
                    }
                    
                    // Make variables globally available
                    window.questions = parsedQuestions;
                    window.userAnswers = Array(parsedQuestions.length).fill(null);
                    window.currentQuestionIndex = 0;
                    
                    // Show the questions display without hiding the form
                    questionsDisplayContainer.classList.remove('hidden');
                    
                    // Display the first question
                    displayCurrentQuestion();
                    updateNavigationButtons();
                    
                    // Show success message
                    showSystemMessage(`已生成 ${parsedQuestions.length} 道 ${schoolType}${grade}${semester}${subject} ${difficulty}难度题目`, 'success');
                } catch (error) {
                    console.error('Error processing questions:', error);
                    showSystemMessage('生成题目时出错，请重试', 'error');
                } finally {
                    // Hide loading state
                    loading.classList.add('hidden');
                }
            })
            .catch(error => {
                console.error('API error:', error);
                showSystemMessage('API调用失败，请重试', 'error');
                loading.classList.add('hidden');
            });
    }
    
    // Initialize the page
    populateGradeOptions(schoolSelect.value);
    populateSubjectOptions(schoolSelect.value);
}); 