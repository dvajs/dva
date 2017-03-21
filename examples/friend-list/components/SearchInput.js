import React, { Component, PropTypes } from 'react';

const ENTER_KEYCODE = 13;

const propTypes = {
  value: PropTypes.string,
  handleSearch: PropTypes.func.isRequired
};

class SearchInput extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleEnterKeyDown = this.handleEnterKeyDown.bind(this);
  }

  handleValueChange(e) {
    this.props.handleSearch(e.target.value);
  }

  handleEnterKeyDown(e) {
    if (e.keyCode === ENTER_KEYCODE) {
      this.props.handleSearch(e.target.value);
    }
  }

  render() {
    return (
      <input
        value={this.props.value || ''}
        placeholder={this.props.placeholder}
        onChange={this.handleValueChange}
        onKeyDown={this.handleEnterKeyDown}
        id="search-input"
        type="search"
      />
    );
  }
}

SearchInput.propTypes = propTypes;
export default SearchInput;
