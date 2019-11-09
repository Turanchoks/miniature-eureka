const toggleDropdown = () => {
  const dropdown = document.querySelector('.country-code-view');
  dropdown.classList.toggle('hide');

  const input = document.querySelector('.country-code-select');
  input.classList.toggle('active');
};

const select = () => {
  const selectViewParent = document.getElementById('main');

  //fake input
  const selectInput = document.createElement('div');
  selectInput.classList = 'country-code-select';
  selectInput.addEventListener('click', toggleDropdown);

  //placeholder
  const inputPlaceholder = document.createElement('div');
  inputPlaceholder.classList = 'country-code-select__placeholder';
  inputPlaceholder.textContent = 'Country';
  // inputPlaceholder.appendChild(dropdownIcon());
  selectInput.appendChild(inputPlaceholder);

  selectViewParent.appendChild(selectInput);

  //dropdown options
  const selectView = document.createElement('div');
  selectView.classList = 'country-code-view hide';
  countries.map(country => {
    const optionEl = document.createElement('div');
    optionEl.classList = 'country-code-view__option';
    const flagEl = document.createElement('span');
    flagEl.setAttribute('class', 'country-code-view__option--flag');
    flagEl.textContent = country.emoji;
    optionEl.appendChild(flagEl);
    optionEl.insertAdjacentHTML('beforeend', country.name);
    selectView.appendChild(optionEl);
  });
  selectViewParent.appendChild(selectView);
};

select();
