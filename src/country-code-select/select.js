let selected = null;

const toggleDropdown = () => {
  const dropdown = document.querySelector('.country-code-view');
  dropdown.classList.toggle('hide');

  const input = document.querySelector('.country-code-select');
  input.classList.toggle('active');
};

const handleChange = country => {
  const placeholder = document.querySelector(
    '.country-code-select__placeholder'
  );
  selected = country;
  if (placeholder) {
    placeholder.classList.add('selected');
    placeholder.textContent = country.name;
  }
};

const select = () => {
  const selected = null;
  const selectViewParent = document.getElementById('main');

  //fake input
  const selectInput = document.createElement('div');
  selectInput.classList = 'country-code-select';
  selectInput.addEventListener('click', toggleDropdown);

  //placeholder
  const inputPlaceholder = document.createElement('div');
  inputPlaceholder.classList = 'country-code-select__placeholder';
  inputPlaceholder.textContent = 'Country';
  selectInput.appendChild(inputPlaceholder);

  //icon
  const dropdownIcon = document.createElement('div');
  dropdownIcon.classList = 'country-code-select__icon';
  dropdownIcon.textContent = '>';
  selectInput.appendChild(dropdownIcon);

  selectViewParent.appendChild(selectInput);

  //dropdown options
  const selectView = document.createElement('div');
  selectView.classList = 'country-code-view hide';
  countries.map(country => {
    const optionEl = document.createElement('div');
    optionEl.classList = 'country-code-view__option';
    const flagEl = document.createElement('span');
    flagEl.textContent = country.emoji;
    optionEl.appendChild(flagEl);
    optionEl.insertAdjacentHTML(
      'beforeend',
      `<span class="country-name">${country.name}</span>`
    );
    optionEl.insertAdjacentHTML(
      'beforeend',
      `<span class="dialling-code">${country.diallingCode}</span>`
    );
    optionEl.addEventListener('click', () => handleChange(country));
    selectView.appendChild(optionEl);
  });
  selectViewParent.appendChild(selectView);
};

select();
