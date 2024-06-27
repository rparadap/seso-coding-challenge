const Heap = require("heap");

/**
 * Not a fan of function comments,
 * but I'll leave this one in place as javascript is not a typed language
 * Merge and drains log sources and prints entries in chronological order
 * @param {Array} logSources - Array of log sources
 * @param {Object} printer - Printer object with print and done methods
 */
module.exports = (logSources, printer) => {
  const logHeap = initializeHeap(logSources);

  while (!logHeap.empty()) {
    processNextLogEntry(logHeap, logSources, printer);
  }

  printer.done();
  console.log("Sync sort complete.");
};

/**
 * Initializes the heap with the first log entry from each log source
 * @param {Array} logSources - Array of log sources
 * @returns {Heap} - Initialized min-heap
 */
function initializeHeap(logSources) {
  const heap = new Heap((a, b) => a.log.date - b.log.date);

  logSources.forEach((source, index) => {
    const log = source.pop();
    if (log) heap.push({ log, index });
  });

  return heap;
}

/**
 * Processes the next log entry from the heap, prints it, and pushes the next log entry from the same source if available
 * @param {Heap} logHeap - Min-heap containing log entries
 * @param {Array} logSources - Array of log sources
 * @param {Object} printer - Printer object with print method
 */
function processNextLogEntry(logHeap, logSources, printer) {
  const { log, index } = logHeap.pop();
  printer.print(log);

  const nextLog = logSources[index].pop();
  if (nextLog) logHeap.push({ log: nextLog, index });
}
