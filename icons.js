const paths = {
  'up-right': 'M4 12 12 4M4 4h8v8',
  left: 'M12 8H4m4-4L4 8l4 4',
  right: 'M4 8h8m-4-4 4 4-4 4',
  down: 'M8 3v10m-4-4 4 4 4-4',
  plus: 'M8 3v10M3 8h10',
};

export const icon = (name = 'up-right') => `<svg class="ui-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="${paths[name] || paths['up-right']}" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
