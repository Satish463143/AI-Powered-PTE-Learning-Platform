const MAX_HISTORY = 12;
const MAX_OFF_TOPIC = 1;

const mockStatus = [
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CHECKED = 'checked'
]
const FileFilterType = {
  IMAGE : 'image',
  VIDEO : 'video',
  DOCUMENT : 'doc',
  AUDIO : 'audio',
  IMAGE_VIDEO: ['image', 'video'],
}

const Section = {
  READING : 'Reading',
  WRITING : 'Writing',
  LISTENING : 'Listening',
  SPEAKING : 'Speaking',
  OVERALL : 'Overall'
}

module.exports = {
  MAX_HISTORY,
  MAX_OFF_TOPIC,
  mockStatus,
  FileFilterType,
  Section
}