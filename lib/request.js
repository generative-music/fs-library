'use strict';

const getSamplesForInstrumentName = async ({
  sampleIndex,
  provider,
  audioContext,
  instrumentName,
}) => {
  const samplePaths = sampleIndex[instrumentName];
  if (Array.isArray(samplePaths)) {
    const audioBuffers = await provider.request(audioContext, samplePaths);
    if (audioBuffers.some((audioBuffer) => audioBuffer === null)) {
      return null;
    }
    return audioBuffers;
  } else if (typeof samplePaths === 'object' && samplePaths !== null) {
    const audioBuffers = await provider.request(
      audioContext,
      Object.values(samplePaths)
    );
    const keys = Object.keys(samplePaths);
    return audioBuffers.reduce((collection, audioBuffer, i) => {
      if (!collection || !audioBuffer) {
        return null;
      }
      const key = keys[i];
      collection[key] = audioBuffer;
      return collection;
    }, {});
  }
  return null;
};

const getSamplesForInstrumentGroup = ({
  sampleIndex,
  provider,
  audioContext,
  instrument,
}) => {
  const instrumentGroup = Array.isArray(instrument) ? instrument : [instrument];
  return instrumentGroup.reduce(
    async (requestedSamplesPromise, instrumentName) => {
      const requestedSamples = await requestedSamplesPromise;
      if (Object.keys(requestedSamples).length > 0) {
        return requestedSamples;
      }
      const audioBuffers = await getSamplesForInstrumentName({
        sampleIndex,
        provider,
        audioContext,
        instrumentName,
      });
      if (!audioBuffers) {
        return {};
      }
      requestedSamples[instrumentName] = audioBuffers;
      return requestedSamples;
    },
    Promise.resolve({})
  );
};

const request = async (
  { sampleIndex, provider },
  audioContext,
  instruments = []
) => {
  const requestedSamplesArray = await Promise.all(
    instruments.map((instrument) =>
      getSamplesForInstrumentGroup({
        sampleIndex,
        provider,
        audioContext,
        instrument,
      })
    )
  );
  return requestedSamplesArray.reduce(
    (allRequestedSamples, requestedSamples) => {
      return Object.assign(allRequestedSamples, requestedSamples);
    },
    {}
  );
};

module.exports = request;
