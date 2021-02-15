'use strict';

const hasSamples = ({ provider, samples }) => {
  if (Array.isArray(samples)) {
    return provider.has(samples);
  }
  if (typeof samples === 'object' && samples !== null) {
    return provider.has(Object.values(samples));
  }
  return Promise.resolve(false);
};

const has = async ({ sampleIndex, provider }, instruments = []) => {
  const hasInstrumentGroupResults = await Promise.all(
    instruments.map(async (instrument) => {
      const instrumentGroup =
        typeof instrument === 'string' ? [instrument] : instrument;
      const hasInstrumentResults = await Promise.all(
        instrumentGroup.map((instrumentName) =>
          hasSamples({ provider, samples: sampleIndex[instrumentName] })
        )
      );
      return hasInstrumentResults.some((hasInstrument) => hasInstrument);
    })
  );
  return hasInstrumentGroupResults.every(
    (hasInstrumentGroup) => hasInstrumentGroup
  );
};

module.exports = has;
