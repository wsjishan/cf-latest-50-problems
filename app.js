// Populate rating select options
const ratings = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500];
const ratingSelect = document.createElement('select');
ratingSelect.id = 'rating-select';
ratings.forEach(rating => {
  const option = document.createElement('option');
  option.value = rating;
  option.textContent = rating;
  ratingSelect.appendChild(option);
});

document.body.insertBefore(ratingSelect, document.getElementById('fetch-problems'));

// Event listener for fetching problems based on selected rating
document.getElementById('fetch-problems').addEventListener('click', async () => {
  const fetchButton = document.getElementById('fetch-problems');
  fetchButton.disabled = true; // Disable the button

  const username = document.getElementById('cf-username').value;
  const selectedRating = document.getElementById('rating-select').value;
  const problemsContainer = document.getElementById('problems');

  // Clear previous results
  problemsContainer.innerHTML = '';

  // Fetch problems from Codeforces API
  const response = await fetch('https://codeforces.com/api/problemset.problems');
  const data = await response.json();
  const problems = data.result.problems.filter(problem => problem.rating == selectedRating).slice(0, 50);

  // Fetch user submissions from Codeforces API
  const userSubmissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
  const userSubmissionsData = await userSubmissionsResponse.json();
  const submissionsByProblem = userSubmissionsData.result.reduce((acc, submission) => {
    const key = `${submission.problem.contestId}-${submission.problem.index}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(submission.verdict);
    return acc;
  }, {});

  // Count accepted problems
  let acceptedCount = 0;
  problems.forEach(problem => {
    const problemId = `${problem.contestId}-${problem.index}`;
    if (submissionsByProblem[problemId] && submissionsByProblem[problemId].includes('OK')) {
      acceptedCount++;
    }
  });

  // Create a fragment to improve performance
  const fragment = document.createDocumentFragment();

  // Display problems and accepted count
  problems.forEach((problem, index) => {
    const problemId = `${problem.contestId}-${problem.index}`;
    const problemElement = document.createElement('div');
    const verdicts = submissionsByProblem[problemId] ? submissionsByProblem[problemId].join(', ') : 'No Submissions';
    problemElement.innerHTML = `
        <p>${index + 1}. ${problem.name} - ${problem.rating}</p>
        <p>Verdicts: ${verdicts}</p>
        <button onclick="goToProblem('${problemId}')">Go to Problem</button>
    `;
    fragment.appendChild(problemElement);

    // Style based on verdicts
    if (verdicts.includes('OK')) {
      problemElement.style.backgroundColor = 'lightgreen';
    } else if (verdicts !== 'No Submissions') {
      problemElement.style.backgroundColor = 'lightcoral';
    }
  });

  // Display the count of accepted problems out of 50
  const acceptedCountElement = document.createElement('p');
  acceptedCountElement.id = 'accepted-count'; // Set ID for the element
  acceptedCountElement.innerHTML = `Accepted: ${acceptedCount} out of 50`;
  fragment.insertBefore(acceptedCountElement, fragment.firstChild);

  // Append the fragment to the problemsContainer
  problemsContainer.appendChild(fragment);

  fetchButton.disabled = false; // Re-enable the button
});

// Function to navigate to a problem on Codeforces
function goToProblem(problemId) {
  const [contestId, index] = problemId.split('-');
  const url = `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  window.open(url, '_blank').focus();
}