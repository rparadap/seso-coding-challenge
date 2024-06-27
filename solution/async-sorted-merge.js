const Heap = require("heap");

/**
 * Not a fan of function comments,
 * but I'll leave this one in place as javascript is not a typed language
 * Asynchronously drains log sources and prints entries in chronological order
 * @param {Array} logSources - Array of log sources
 * @param {Object} printer - Printer object with print and done methods
 */
module.exports = async (logSources, printer) => {
  const logHeap = await initializeHeapAsync(logSources);
  while (!logHeap.empty()) {
    await processNextLogEntryAsync(logHeap, logSources, printer);
  }
  printer.done();
  console.log("Async sort complete.");
};

/**
 * Initializes the heap with the first log entry from each log source asynchronously
 * @param {Array} logSources - Array of log sources
 * @returns {Heap} - Initialized min-heap
 */
async function initializeHeapAsync(logSources) {
  const heap = new Heap((a, b) => a.log.date - b.log.date);

  await Promise.all(
    logSources.map(async (source, index) => {
      const log = await source.popAsync();
      if (log) heap.push({ log, index });
    })
  );

  return heap;
}

/**
 * Processes the next log entry from the heap asynchronously, prints it, and pushes the next log entry from the same source if available
 * @param {Heap} logHeap - Min-heap containing log entries
 * @param {Array} logSources - Array of log sources
 * @param {Object} printer - Printer object with print method
 */
async function processNextLogEntryAsync(logHeap, logSources, printer) {
  const { log, index } = logHeap.pop();
  printer.print(log);

  const nextLog = await logSources[index].popAsync();
  if (nextLog) logHeap.push({ log: nextLog, index });
}
