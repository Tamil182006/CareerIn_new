const { exec } = require("child_process");
const path = require("path");

module.exports = function runParser(filePath) {
  return new Promise((resolve, reject) => {
    // Points to resume_parser-main/run_parser.py at project root
    const parserScript = path.join(
      __dirname,
      "../../../resume_parser-main/run_parser.py"
    );

    const absFilePath = path.resolve(filePath);

    exec(`python "${parserScript}" "${absFilePath}"`, (err, stdout, stderr) => {
      if (err) {
        console.error("Parser stderr:", stderr);
        return reject(new Error(err.message));
      }

      // The parser prints some [INFO] lines before the JSON.
      // Extract only the last valid JSON block from stdout.
      try {
        const lines = stdout.trim().split("\n");
        // Find the line that starts with '{' (the JSON output)
        const jsonLine = lines.find((l) => l.trim().startsWith("{"));
        if (!jsonLine) throw new Error("No JSON found in parser output");
        const parsed = JSON.parse(jsonLine);
        resolve(parsed);
      } catch (e) {
        console.error("Parser stdout:", stdout);
        reject(new Error("Parser output is not valid JSON: " + e.message));
      }
    });
  });
};
