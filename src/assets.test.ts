/// <reference types="node" />
import path from 'path';
import { readTopCorners } from './testUtils/png';

describe('image assets', () => {
  it('has a transparent Home banner background, so it works on the dark theme too', () => {
    const { topLeft, topRight } = readTopCorners(
      path.join(__dirname, '../assets/home-header-banner.png')
    );

    expect(topLeft.a).toBe(0);
    expect(topRight.a).toBe(0);
  });
});
