import React from 'react';
import styled from 'styled-components';

const AnchorButton = styled.button`
  display: inline-block;
  margin: 0;
  padding: 0;
  font-family: inherit;
  font-size: 16px;
  font-weight: 200;
  border: none;
  text-decoration: underline;
  background-color: transparent;
  color: var(--ndaify-fg);
  cursor: pointer;
  transition: none;

  :disabled {
    cursor: not-allowed;
  }
`;

export default (props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <AnchorButton type="button" {...props} />
);
