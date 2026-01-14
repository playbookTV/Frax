import { expect, test } from 'plugma/vitest';
import * as effectGenerator from '../src/main/effectGenerator';

test('simple truth', () => {
    expect(true).to.equal(true);
});

test('rgbToLab exists', () => {
    expect(typeof effectGenerator.rgbToLab).to.equal('function');
});

test('fibonacci stripes exists', () => {
    expect(typeof effectGenerator.calculateFibonacciStripes).to.equal('function');
});
