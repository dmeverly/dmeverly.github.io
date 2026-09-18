(function () {
    "use strict";

    const fileInput = document.getElementById("sched-file");
    const pasteInput = document.getElementById("sched-paste");
    const pasteParseButton = document.getElementById("sched-paste-parse");
    const weekInput = document.getElementById("sched-week");
    const monthInput = document.getElementById("sched-month");
    const weekStartInput = document.getElementById("sched-weekstart");
    const yearInput = document.getElementById("sched-year");
    const generateButton = document.getElementById("sched-generate");
    const clearButton = document.getElementById("sched-clear");
    const status = document.getElementById("sched-status");
    const loadStatus = document.getElementById("sched-load-status");
    const form = document.getElementById("schedule-form");
    const configure = document.getElementById("sched-configure");
    const step1Card = document.getElementById("sched-step-1-card");
    const weekHint = document.getElementById("sched-week-hint");
    const fileNameLabel = document.getElementById("sched-filename");
    const summary = document.getElementById("sched-summary");
    const groupsContainer = document.getElementById("sched-groups");
    const previewContainer = document.getElementById("sched-preview");
    const templateWeeksInput = document.getElementById("sched-template-weeks");
    const downloadTemplateButton = document.getElementById("sched-download-template");

    const requiredEls = [
        fileInput, pasteInput, pasteParseButton, weekInput, monthInput, yearInput, weekStartInput, generateButton, clearButton,
        status, loadStatus, form, configure, step1Card, weekHint, fileNameLabel, summary, groupsContainer, previewContainer, templateWeeksInput, downloadTemplateButton
    ];
    if (requiredEls.some((el) => !el)) return;

    if (typeof ExcelJS === "undefined" || typeof JSZip === "undefined") {
        setMessage(loadStatus, "This tool could not load its dependencies. Please reload the page.", "error");
        generateButton.disabled = true;
        downloadTemplateButton.disabled = true;
        return;
    }

    // ----- Output calendar layout (Sun-Sat or Mon-Sun, chosen by the user) -----
    const COLS_PER_WEEK = 14;
    const DATA_START_ROW = 4;
    const HEADER_ROW = 3;
    const TITLE_ROWS = 2;
    const COL_WIDTH = 16;
    const ROW_HEIGHT_BASE = 25;
    const ROW_HEIGHT_PER_LINE = 13;
    const NUM_MONTHS = 12;

    // Weekdays are indexed Monday = 0 ... Sunday = 6 throughout.
    const DOW = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const SUNDAY = 6;
    const MONDAY = 0;
    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const DAY_NAME_PATTERNS = [
        { index: 0, patterns: [/^mon/i, /^mo$/i] },
        { index: 1, patterns: [/^tue/i, /^tu$/i] },
        { index: 2, patterns: [/^wed/i, /^we$/i] },
        { index: 3, patterns: [/^thu/i, /^th$/i] },
        { index: 4, patterns: [/^fri/i, /^fr$/i] },
        { index: 5, patterns: [/^sat/i, /^sa$/i] },
        { index: 6, patterns: [/^sun/i, /^su$/i] }
    ];
    const MAX_HEADER_SEARCH_ROWS = 50;
    const MAX_DETECTED_GROUPS = 20;
    const MAX_DETECTED_WEEKS = 520;
    const MAX_READ_COLUMNS = 200;
    const MAX_PREVIEW_EMPLOYEES = 100;
    const MAX_PASTE_LINES = 700;

    const MAX_FILE_BYTES = 5 * 1024 * 1024;
    const MAX_READ_ROWS = 1000;
    const MAX_PASTE_CHARS = 500000;
    const MAX_EMPLOYEES = 150;
    const MAX_NAME_LENGTH = 60;
    const MAX_LABEL_LENGTH = 40;
    const MAX_CELL_TEXT_LENGTH = 32767;
    const MAX_FILE_NAME_PART = 50;


    const UNSAFE_TEXT_RE = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g;


    const SHIFT_COLORS = new Map([
        ["none", { label: "No color", argb: null }],
        ["yellow", { label: "Yellow", argb: "FFFFFF00" }],
        ["gray", { label: "Gray", argb: "FFADADAD" }],
        ["blue", { label: "Blue", argb: "FF9DC3E6" }],
        ["green", { label: "Green", argb: "FFA9D08E" }],
        ["orange", { label: "Orange", argb: "FFF4B183" }],
        ["pink", { label: "Pink", argb: "FFFFB6C1" }],
        ["purple", { label: "Purple", argb: "FFCDB4DB" }]
    ]);

    const BLANK_TEMPLATE_GROUPS = ["Day 1", "Day 2", "Nights"];
    const BLANK_TEMPLATE_DAY_HEADERS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
    const DEFAULT_TEMPLATE_WEEKS = 12;

    const STYLES = {
        fontMonth: { name: "Arial", size: 14, bold: true },
        fontDay: { name: "Arial", size: 11, bold: true },
        fontCell: { name: "Arial", size: 10 },
        alignTopLeft: { horizontal: "left", vertical: "top", wrapText: true },
        alignCenter: { horizontal: "center", vertical: "center", wrapText: true },
        thinBorder: {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" }
        }
    };

    function colorKeyOrNone(key) {
        return SHIFT_COLORS.has(key) ? key : "none";
    }

    function fillFor(key) {
        const argb = SHIFT_COLORS.get(colorKeyOrNone(key)).argb;
        return argb ? { type: "pattern", pattern: "solid", fgColor: { argb } } : null;
    }

    function cleanText(value) {
        return String(value).replace(UNSAFE_TEXT_RE, " ").replace(/\s+/g, " ").trim();
    }

    let selectedFile = null;
    // parsedModel: { source: {kind:"workbook", sourceWorksheet} | {kind:"pasted", grid}, shiftGroups, weekCount, employees }
    let parsedModel = null;
    let busy = false;

    class UserFacingError extends Error {}

    function setMessage(el, message, kind) {
        el.textContent = message;
        el.dataset.kind = kind || "";
    }


    function setLoadStatus(message, kind) {
        setMessage(loadStatus, message, kind);
    }

    function setStatus(message, kind) {
        setMessage(status, message, kind);
    }

    function setDefaultDate() {
        const now = new Date();
        monthInput.value = String(now.getMonth() + 1);
        yearInput.value = String(now.getFullYear());
    }

    function updateGenerateAvailability() {
        generateButton.disabled = busy || !parsedModel;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });

    pasteInput.addEventListener("paste", () => {
        window.setTimeout(() => {
            void handlePasteParse();
        }, 0);
    });

    fileInput.addEventListener("change", () => {
        void handleFileSelected();
    });

    pasteParseButton.addEventListener("click", () => {
        void handlePasteParse();
    });

    [weekInput, monthInput, yearInput, weekStartInput].forEach((el) => {
        el.addEventListener("input", () => {
            renderPreviewIfPossible();
        });
    });

    clearButton.addEventListener("click", () => {
        fileInput.value = "";
        pasteInput.value = "";
        selectedFile = null;
        resetParsedState();
        fileNameLabel.textContent = "No file selected.";
        weekInput.value = "";
        weekStartInput.value = String(SUNDAY);
        setDefaultDate();
        setLoadStatus("");
        setStatus("");
        fileInput.focus();
    });

    generateButton.addEventListener("click", () => {
        void handleGenerate();
    });

    downloadTemplateButton.addEventListener("click", () => {
        void handleDownloadTemplate();
    });

    function resetParsedState() {
        parsedModel = null;
        summary.textContent = "";
        configure.hidden = true;
        step1Card.classList.remove("tool-step--done");
        setStatus("");
        clearPreview();
        clearGroupEditor();
        weekInput.removeAttribute("max");
        updateGenerateAvailability();
    }

    function buildParsedModelFromGrid(grid, source) {
        const { shiftGroups, weekCount, templateWeekStart } = preProcessTemplate(grid);
        const employees = extractEmployees(shiftGroups);
        if (employees.length > MAX_EMPLOYEES) {
            throw new UserFacingError(
                `That template has more than ${MAX_EMPLOYEES} different names. Check that only employee names are in the day columns.`
            );
        }
        return { source, shiftGroups, weekCount, templateWeekStart, employees };
    }

    function applyParsedModel(model) {
        parsedModel = model;

        weekInput.max = String(model.weekCount);
        if (!weekInput.value || Number(weekInput.value) > model.weekCount) {
            weekInput.value = "1";
        }
        weekHint.textContent =
            `Your template has ${plural(model.weekCount, "week")} (enter 1 to ${model.weekCount}). ` +
            "The calendar begins on that week, then continues through the rotation and loops back to week 1.";
        if (!monthInput.value) setDefaultDate();
        if (!yearInput.value) yearInput.value = String(new Date().getFullYear());

        renderGroupEditor(model.shiftGroups);
        configure.hidden = false;
        step1Card.classList.add("tool-step--done");

        if (model.employees.length === 0) {
            summary.textContent = "";
            setLoadStatus(
                "The template was read, but no employee names were found. Check that names are typed under the day columns.",
                "warning"
            );
        } else {
            const names = model.employees.slice(0, MAX_PREVIEW_EMPLOYEES).join(", ") +
                (model.employees.length > MAX_PREVIEW_EMPLOYEES
                    ? `, and ${model.employees.length - MAX_PREVIEW_EMPLOYEES} more`
                    : "");
            summary.textContent =
                `What we found: ${plural(model.shiftGroups.length, "shift")}, ` +
                `${plural(model.weekCount, "week")} of rotation, and ${plural(model.employees.length, "person", "people")} ` +
                `(${names}). If this looks wrong, check your template and try again.`;
            setLoadStatus("Template loaded. Continue with step 2.", "success");
        }

        renderPreviewIfPossible();
    }

    function plural(n, singular, pluralForm) {
        return `${n} ${n === 1 ? singular : pluralForm || `${singular}s`}`;
    }

    async function handleFileSelected() {
        const file = fileInput.files && fileInput.files[0];
        selectedFile = file || null;
        resetParsedState();

        if (!file) {
            fileNameLabel.textContent = "No file selected.";
            setLoadStatus("");
            return;
        }

        fileNameLabel.textContent = file.name;
        pasteInput.value = "";
        setLoadStatus("Reading your file...");

        try {
            if (file.size > MAX_FILE_BYTES) {
                throw new UserFacingError("That file is too large. A rotation template should be well under 5 MB.");
            }
            const buffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const sourceWorksheet = workbook.worksheets[0];
            if (!sourceWorksheet) {
                throw new UserFacingError("That file has no sheets in it. Please choose a different file.");
            }

            const grid = readGrid(sourceWorksheet);
            const model = buildParsedModelFromGrid(grid, { kind: "workbook", sourceWorksheet });
            applyParsedModel(model);
        } catch (error) {
            parsedModel = null;
            if (error instanceof UserFacingError) {
                setLoadStatus(error.message, "error");
            } else {
                console.error(error);
                setLoadStatus(
                    "We couldn't read that file. Make sure it is an .xlsx spreadsheet laid out like the example in step 1.",
                    "error"
                );
            }
        } finally {
            updateGenerateAvailability();
        }
    }

    async function handlePasteParse() {
        const text = pasteInput.value;
        selectedFile = null;
        resetParsedState();

        if (!text || !text.trim()) {
            setLoadStatus("Paste your copied cells into the box first.", "error");
            return;
        }

        fileInput.value = "";
        fileNameLabel.textContent = "No file selected.";
        setLoadStatus("Reading pasted cells...");

        try {
            const grid = parsePastedGrid(text);
            const model = buildParsedModelFromGrid(grid, { kind: "pasted", grid });
            applyParsedModel(model);
        } catch (error) {
            parsedModel = null;
            if (error instanceof UserFacingError) {
                setLoadStatus(error.message, "error");
            } else {
                console.error(error);
                setLoadStatus(
                    "We couldn't read those cells. Make sure you copied the day-name row and the rows below it.",
                    "error"
                );
            }
        } finally {
            updateGenerateAvailability();
        }
    }

    function renderPreviewIfPossible() {
        if (!parsedModel) return;
        const week = Number.parseInt(weekInput.value, 10);
        const month = Number.parseInt(monthInput.value, 10);
        const year = Number.parseInt(yearInput.value, 10);
        if (!Number.isInteger(week) || week < 1 || week > parsedModel.weekCount) return;
        if (!Number.isInteger(month) || month < 1 || month > 12) return;
        if (!Number.isInteger(year) || year < 1900 || year > 2400) return;

        const grid = computeMainMonthGrid(
            parsedModel.shiftGroups, parsedModel.weekCount, parsedModel.templateWeekStart,
            week, month, year, calendarStartDay()
        );
        renderPreview(grid);
    }

    async function handleGenerate() {
        if (busy || !parsedModel) return;

        const params = readInputs(parsedModel.weekCount);
        if (!params.valid) {
            setStatus(params.message, "error");
            return;
        }

        busy = true;
        updateGenerateAvailability();
        setStatus("Building your schedules...");

        try {
            const { source, shiftGroups, weekCount, templateWeekStart, employees } = parsedModel;
            const calStart = params.calStart;

            const mainWorkbook = new ExcelJS.Workbook();
            if (source.kind === "workbook") {
                addTemplateSheet(mainWorkbook, source.sourceWorksheet);
            } else {
                addTemplateSheetFromGrid(mainWorkbook, source.grid);
            }

            const employeeWorkbooks = new Map();
            employees.forEach((name) => employeeWorkbooks.set(name, new ExcelJS.Workbook()));

            let month = params.month;
            let year = params.year;
            let week = params.week;
            for (let i = 0; i < NUM_MONTHS; i += 1) {
                if (month === 13) {
                    month = 1;
                    year += 1;
                }
                week = createMonthSheets(
                    mainWorkbook, employeeWorkbooks, shiftGroups, weekCount, templateWeekStart, calStart, week, month, year
                );
                month += 1;
            }

            setStatus("Almost done, packaging the files...");

            const timestamp = formatTimestamp(new Date());
            const zip = new JSZip();

            const mainBuffer = await mainWorkbook.xlsx.writeBuffer();
            zip.file(`Schedule_${timestamp}.xlsx`, mainBuffer);

            const usedNames = new Set();
            for (const [name, wb] of employeeWorkbooks.entries()) {
                const empBuffer = await wb.xlsx.writeBuffer();
                // Two different names can sanitize to the same text; keep every file.
                const base = sanitizeFileName(name);
                let unique = base;
                for (let n = 2; usedNames.has(unique.toLowerCase()); n += 1) unique = `${base}_${n}`;
                usedNames.add(unique.toLowerCase());
                zip.file(`Schedule_Employee_${unique}_${timestamp}.xlsx`, empBuffer);
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            downloadBlob(zipBlob, `Schedules_${timestamp}.zip`);

            const employeeNote = employees.length
                ? ` and ${plural(employees.length, "employee calendar")}`
                : "";
            setStatus(
                `Done! Your download has the ${NUM_MONTHS}-month calendar${employeeNote}. Check your downloads folder for a .zip file.`,
                "success"
            );
        } catch (error) {
            if (error instanceof UserFacingError) {
                setStatus(error.message, "error");
            } else {
                console.error(error);
                setStatus("Something went wrong while building the schedules. Please check your template and try again.", "error");
            }
        } finally {
            busy = false;
            updateGenerateAvailability();
        }
    }

    async function handleDownloadTemplate() {
        const weeksRaw = Number.parseInt(templateWeeksInput.value, 10);
        const weeks = Number.isInteger(weeksRaw) && weeksRaw >= 1 && weeksRaw <= MAX_DETECTED_WEEKS
            ? weeksRaw
            : DEFAULT_TEMPLATE_WEEKS;

        try {
            const workbook = buildBlankTemplateWorkbook(weeks);
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            downloadBlob(blob, "Template.xlsx");
        } catch (error) {
            console.error(error);
            setLoadStatus("Could not build a template file. Please try again.", "error");
        }
    }

    function calendarStartDay() {
        return Number.parseInt(weekStartInput.value, 10) === MONDAY ? MONDAY : SUNDAY;
    }

    function readInputs(weekCount) {
        const week = Number.parseInt(weekInput.value, 10);
        const month = Number.parseInt(monthInput.value, 10);
        const year = Number.parseInt(yearInput.value, 10);

        if (!Number.isInteger(week) || week < 1 || week > weekCount) {
            return { valid: false, message: `Enter a template week from 1 to ${weekCount} in step 3.` };
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            return { valid: false, message: "Choose a first month in step 3." };
        }
        if (!Number.isInteger(year) || year < 1900 || year > 2400) {
            return { valid: false, message: "Enter a year between 1900 and 2400 in step 3." };
        }

        return { valid: true, week, month, year, calStart: calendarStartDay() };
    }

    // ----- Cell value helpers -----

    function cellText(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "object") {
            if (typeof value.text === "string") return value.text;
            if (value.richText) return value.richText.map((part) => part.text).join("");
            if ("result" in value) return cellText(value.result);
            if (value instanceof Date) return value.toISOString();
            return null;
        }
        return String(value);
    }

    function readGrid(worksheet) {
        const raw = worksheet.getSheetValues();
        const colCount = Math.min(Math.max(worksheet.columnCount, 1), MAX_READ_COLUMNS);
        const grid = [];
        const rowEnd = Math.min(raw.length, MAX_READ_ROWS + 1);
        for (let r = 1; r < rowEnd; r += 1) {
            const row = raw[r] || [];
            const outRow = [];
            for (let c = 1; c <= colCount; c += 1) {
                outRow.push(cellText(row[c]));
            }
            grid.push(outRow);
        }
        return grid;
    }

    function normalizeEmployee(value) {
        if (value === null || value === undefined) return null;
        const employee = cleanText(value).slice(0, MAX_NAME_LENGTH).trim();
        if (!employee) return null;
        const lower = employee.toLowerCase();
        if (lower === "nan" || lower === "none" || lower === "x") return null;
        return employee.charAt(0).toUpperCase() + employee.slice(1).toLowerCase();
    }

    // ----- Dynamic template structure detection -----

    function deriveShiftLabel(headerText) {
        const original = cleanText(headerText).slice(0, MAX_LABEL_LENGTH);
        let s = original.replace(/\s*\d+\s*$/, "").trim();
        if (s.length > 3 && /s$/i.test(s)) s = s.slice(0, -1);
        return s || original;
    }

    function computeDefaultShiftLabel(label, index, total) {
        if (label) return deriveShiftLabel(label);
        return index === total - 1 ? "Night" : "Day";
    }

    // Day and night shifts start out yellow and gray; the user can change any of them.
    function computeDefaultShiftColor(shiftLabel) {
        const lower = String(shiftLabel).trim().toLowerCase();
        if (lower === "day") return "yellow";
        if (lower === "night") return "gray";
        return "none";
    }

    function effectiveShiftLabel(group, index) {
        const cleaned = group.shiftLabel ? cleanText(group.shiftLabel).slice(0, MAX_LABEL_LENGTH) : "";
        return cleaned || `Shift ${index + 1}`;
    }

    function colLetter(n) {
        let s = "";
        let num = n;
        while (num > 0) {
            const rem = (num - 1) % 26;
            s = String.fromCharCode(65 + rem) + s;
            num = Math.floor((num - 1) / 26);
        }
        return s;
    }

    function matchDayIndex(value) {
        const s = value === null || value === undefined ? "" : String(value).trim();
        if (!s) return null;
        for (const entry of DAY_NAME_PATTERNS) {
            for (const pattern of entry.patterns) {
                if (pattern.test(s)) return entry.index;
            }
        }
        return null;
    }


    function detectGroups(headerRow) {
        const groups = [];
        let col = 0;
        while (col < headerRow.length && groups.length < MAX_DETECTED_GROUPS) {
            const dayIndices = [];
            let ok = true;
            for (let d = 0; d < 7; d += 1) {
                const idx = matchDayIndex(headerRow[col + 1 + d]);
                if (idx === null) {
                    ok = false;
                    break;
                }
                dayIndices.push(idx);
            }
            if (ok && new Set(dayIndices).size === 7) {
                const labelCell = headerRow[col];
                const label = labelCell !== null && labelCell !== undefined && String(labelCell).trim() !== ""
                    ? cleanText(labelCell).slice(0, MAX_LABEL_LENGTH)
                    : null;
                groups.push({ labelCol: col, label, dayOrder: dayIndices });
                col += 8;
            } else {
                col += 1;
            }
        }
        return groups;
    }

    function findHeaderRow(grid) {
        const limit = Math.min(grid.length, MAX_HEADER_SEARCH_ROWS);
        for (let r = 0; r < limit; r += 1) {
            const groups = detectGroups(grid[r] || []);
            if (groups.length > 0) return { rowIndex: r, groups };
        }
        return null;
    }

    function detectWeekCount(grid, headerRowIndex) {
        let count = 0;
        let row = headerRowIndex + 1;
        while (row < grid.length && count < MAX_DETECTED_WEEKS) {
            const rowData = grid[row] || [];
            const hasAnyValue = rowData.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
            if (!hasAnyValue) break;
            count += 1;
            row += 1;
        }
        return count;
    }

    function preProcessTemplate(grid) {
        const header = findHeaderRow(grid);
        if (!header) {
            throw new UserFacingError(
                "We couldn't find the row of day names (Mon, Tue, Wed, Thu, Fri, Sat, Sun). Each shift needs a label column " +
                "followed by those seven columns. Open the example under step 1 to see the layout."
            );
        }
        const { rowIndex: headerRowIndex, groups } = header;
        const weekCount = detectWeekCount(grid, headerRowIndex);
        if (weekCount === 0) {
            throw new UserFacingError("The day names were found, but there are no weeks under them. Add one row per week of your rotation.");
        }

        const filePositionForWeekday = new Array(7);
        groups[0].dayOrder.forEach((weekdayIdx, filePos) => {
            filePositionForWeekday[weekdayIdx] = filePos;
        });

        const shiftGroups = groups.map((g, gi) => ({
            label: g.label,
            labelCol: g.labelCol,
            columnRange: `${colLetter(g.labelCol + 1)}–${colLetter(g.labelCol + 8)}`,
            shiftLabel: computeDefaultShiftLabel(g.label, gi, groups.length),
            color: "none",
            weeks: []
        }));

        shiftGroups.forEach((group) => {
            group.color = computeDefaultShiftColor(group.shiftLabel);
        });

        for (let w = 0; w < weekCount; w += 1) {
            const row = grid[headerRowIndex + 1 + w] || [];
            groups.forEach((g, gi) => {
                const days = [];
                for (let weekday = 0; weekday < 7; weekday += 1) {
                    const filePos = filePositionForWeekday[weekday];
                    days.push(row[g.labelCol + 1 + filePos] ?? null);
                }
                shiftGroups[gi].weeks.push(days);
            });
        }

        // A template row is one week, starting on whichever day its first column is (Sun-Sat or Mon-Sun).
        return { shiftGroups, weekCount, headerRowIndex, templateWeekStart: groups[0].dayOrder[0] };
    }

    // ----- Free-text paste input (tab- or comma-separated, e.g. copied from Excel) -----

    function parsePastedGrid(text) {
        if (text.length > MAX_PASTE_CHARS) {
            throw new UserFacingError("That is too much pasted text. Copy only the template cells.");
        }
        const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        let lines = normalized.split("\n");
        while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
        if (lines.length === 0) {
            throw new UserFacingError("No data found in the pasted text.");
        }
        if (lines.length > MAX_PASTE_LINES) lines = lines.slice(0, MAX_PASTE_LINES);

        const delimiter = normalized.includes("\t") ? "\t" : ",";
        return lines.map((line) => line.split(delimiter, MAX_READ_COLUMNS).map((cell) => {
            const trimmed = cell.trim();
            return trimmed === "" ? null : trimmed;
        }));
    }

    function extractEmployees(shiftGroups) {
        const employees = new Set();
        for (const group of shiftGroups) {
            for (const week of group.weeks) {
                for (const value of week) {
                    const normalized = normalizeEmployee(value);
                    if (normalized) employees.add(normalized);
                }
            }
        }
        return Array.from(employees).sort();
    }

    // ----- Shift text formatting -----

    function buildMainShiftLines(date, assignments, showWeekLabel, weekNumber) {
        const line = (a) => ({ text: `${a.emp} - ${a.shiftLabel}`, color: a.color });
        const dayAssignments = assignments.filter((a) => a.shiftLabel.toLowerCase() === "day");
        const nightAssignments = assignments.filter((a) => a.shiftLabel.toLowerCase() === "night");

        const lines = [{ text: String(date), color: null }];
        if (assignments.length === 2 && dayAssignments.length === 1 && nightAssignments.length === 1) {
            lines.push(line(dayAssignments[0]), { text: "", color: null }, line(nightAssignments[0]));
        } else {
            assignments.forEach((a) => lines.push(line(a)));
        }

        if (showWeekLabel) lines.push({ text: `Template Week ${weekNumber}`, color: null });
        return lines;
    }

    function buildMainShiftText(date, assignments, showWeekLabel, weekNumber) {
        return buildMainShiftLines(date, assignments, showWeekLabel, weekNumber).map((l) => l.text).join("\n");
    }

    function buildEmployeeShiftText(date, assignments, showWeekLabel, weekNumber, targetEmp) {
        const matches = assignments.filter((a) => a.emp === targetEmp);
        if (matches.length === 0) {
            if (showWeekLabel) return [`Template Week ${weekNumber}`, null];
            return [" ", null];
        }
        let text = `${date}\n${matches.map((a) => `${a.emp} - ${a.shiftLabel}`).join("\n")}`;
        if (showWeekLabel) text += `\nTemplate Week ${weekNumber}`;
        return [text, matches[matches.length - 1].color];
    }

    function assignmentsFor(shiftGroups, weekIdx, day) {
        const assignments = [];
        shiftGroups.forEach((group, gi) => {
            const emp = normalizeEmployee(group.weeks[weekIdx][day]);
            if (emp) {
                assignments.push({
                    emp,
                    shiftLabel: effectiveShiftLabel(group, gi),
                    color: colorKeyOrNone(group.color)
                });
            }
        });
        return assignments;
    }

    // ----- Calendar math -----

    function daysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    function firstWeekdayMondayBased(year, month) {
        const jsDay = new Date(year, month - 1, 1).getDay();
        return (jsDay + 6) % 7;
    }

    function orderedDays(calStart) {
        return DOW.map((_, i) => (calStart + i) % 7);
    }

    // Where a month sits on the printed calendar: its first weekday, the column that falls in,
    // and how many calendar rows it needs.
    function monthLayout(year, month, calStart) {
        const firstWeekday = firstWeekdayMondayBased(year, month);
        const startCol = (firstWeekday - calStart + 7) % 7;
        const length = daysInMonth(year, month);
        return { firstWeekday, startCol, length, weeksInMonth: Math.ceil((startCol + length) / 7) };
    }

    // Walks every date in the month, giving its calendar row/column and template weekday.
    // The template week advances after the last day of a template week, which is not
    // necessarily the last column of the calendar row. Returns the template week to use next.
    function forEachDate(layout, templateWeekStart, weekCount, weekNumberIn, visit) {
        const templateWeekEnd = (templateWeekStart + 6) % 7;
        let weekNumber = weekNumberIn;
        for (let date = 1; date <= layout.length; date += 1) {
            const offset = layout.startCol + date - 1;
            const weekday = (layout.firstWeekday + date - 1) % 7;
            visit({
                date,
                week: Math.floor(offset / 7),
                day: offset % 7,
                weekday,
                weekNumber,
                startsTemplateWeek: weekday === templateWeekStart
            });
            if (weekday === templateWeekEnd) {
                weekNumber += 1;
                if (weekNumber > weekCount) weekNumber = 1;
            }
        }
        return weekNumber;
    }

    function computeMainMonthGrid(shiftGroups, weekCount, templateWeekStart, weekNumberIn, month, year, calStart) {
        const title = `${MONTH_NAMES[month - 1]} ${year}`;
        const layout = monthLayout(year, month, calStart);

        const cells = [];
        for (let w = 0; w < layout.weeksInMonth; w += 1) cells.push(new Array(7).fill(null));

        forEachDate(layout, templateWeekStart, weekCount, weekNumberIn, (d) => {
            const assignments = assignmentsFor(shiftGroups, d.weekNumber - 1, d.weekday);
            cells[d.week][d.day] = buildMainShiftLines(d.date, assignments, d.startsTemplateWeek, d.weekNumber);
        });

        return { title, weeksInMonth: layout.weeksInMonth, calStart, cells };
    }

    // ----- Worksheet writing -----

    function applyTitle(sheet, title) {
        sheet.mergeCells(1, 1, TITLE_ROWS, COLS_PER_WEEK);
        const cell = sheet.getCell(1, 1);
        cell.value = title;
        cell.font = STYLES.fontMonth;
        cell.alignment = STYLES.alignCenter;
        cell.border = STYLES.thinBorder;
    }

    function applyHeaders(sheet, calStart) {
        orderedDays(calStart).forEach((weekday, i) => {
            const day = DOW[weekday];
            const col = i * 2 + 1;
            sheet.mergeCells(HEADER_ROW, col, HEADER_ROW, col + 1);
            const cell = sheet.getCell(HEADER_ROW, col);
            cell.value = day;
            cell.font = STYLES.fontDay;
            cell.alignment = STYLES.alignCenter;
        });
    }

    function writeShiftCell(sheet, row, col, value, colorKey) {
        sheet.mergeCells(row, col, row, col + 1);
        const cell = sheet.getCell(row, col);
        cell.value = value;
        cell.alignment = STYLES.alignTopLeft;
        cell.font = STYLES.fontCell;
        cell.border = STYLES.thinBorder;
        const fill = fillFor(colorKey);
        if (fill) cell.fill = fill;
    }

    function applyBorders(sheet, weeksInMonth) {
        for (let row = HEADER_ROW; row < DATA_START_ROW + weeksInMonth; row += 1) {
            for (let col = 1; col <= COLS_PER_WEEK; col += 1) {
                sheet.getCell(row, col).border = STYLES.thinBorder;
            }
        }
    }

    function setColumnWidths(sheet) {
        for (let col = 1; col <= COLS_PER_WEEK; col += 1) {
            sheet.getColumn(col).width = COL_WIDTH;
        }
    }

    function setRowHeights(sheet, weeksInMonth) {
        for (let row = DATA_START_ROW; row < DATA_START_ROW + weeksInMonth; row += 1) {
            let maxLines = 1;
            for (let col = 1; col < COLS_PER_WEEK; col += 2) {
                const value = sheet.getCell(row, col).value;
                const lines = typeof value === "string" ? value.split("\n").length : 1;
                if (lines > maxLines) maxLines = lines;
            }
            sheet.getRow(row).height = Math.max(ROW_HEIGHT_BASE, maxLines * ROW_HEIGHT_PER_LINE);
        }
    }

    function setPageSetup(sheet) {
        sheet.pageSetup.orientation = "landscape";
        sheet.pageSetup.fitToPage = true;
        sheet.pageSetup.fitToWidth = 1;
        sheet.pageSetup.fitToHeight = 1;
    }

    function formatSheet(sheet, weeksInMonth) {
        applyBorders(sheet, weeksInMonth);
        setColumnWidths(sheet);
        setRowHeights(sheet, weeksInMonth);
        setPageSetup(sheet);
    }

    function createMonthSheets(
        mainWorkbook, employeeWorkbooks, shiftGroups, weekCount, templateWeekStart, calStart, weekNumberIn, month, year
    ) {
        const title = `${MONTH_NAMES[month - 1]} ${year}`;
        const mainSheet = mainWorkbook.addWorksheet(title);

        const employeeSheets = new Map();
        for (const [name, wb] of employeeWorkbooks.entries()) {
            employeeSheets.set(name, wb.addWorksheet(title));
        }

        const layout = monthLayout(year, month, calStart);

        applyTitle(mainSheet, title);
        applyHeaders(mainSheet, calStart);
        for (const sheet of employeeSheets.values()) {
            applyTitle(sheet, title);
            applyHeaders(sheet, calStart);
        }

        const nextWeekNumber = forEachDate(layout, templateWeekStart, weekCount, weekNumberIn, (d) => {
            const col = d.day * 2 + 1;
            const row = DATA_START_ROW + d.week;
            const assignments = assignmentsFor(shiftGroups, d.weekNumber - 1, d.weekday);
            const mainText = buildMainShiftText(d.date, assignments, d.startsTemplateWeek, d.weekNumber);
            writeShiftCell(mainSheet, row, col, mainText);

            for (const [name, sheet] of employeeSheets.entries()) {
                const [empText, colorKey] = buildEmployeeShiftText(
                    d.date, assignments, d.startsTemplateWeek, d.weekNumber, name
                );
                writeShiftCell(sheet, row, col, empText, colorKey);
            }
        });

        formatSheet(mainSheet, layout.weeksInMonth);
        for (const sheet of employeeSheets.values()) {
            formatSheet(sheet, layout.weeksInMonth);
        }

        return nextWeekNumber;
    }

    function templateCellValue(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "object") {
            if (value instanceof Date) return value;
            if (typeof value.text === "string") return value.text.slice(0, MAX_CELL_TEXT_LENGTH);
            if (value.richText) return value.richText.map((part) => part.text).join("").slice(0, MAX_CELL_TEXT_LENGTH);
            if ("result" in value) return templateCellValue(value.result);
            return null;
        }
        if (typeof value === "string") return value.slice(0, MAX_CELL_TEXT_LENGTH);
        if (typeof value === "number" || typeof value === "boolean") return value;
        return null;
    }

    // Copies only a plain solid fill from the user's file, rebuilt from validated values,
    // rather than passing the file's own style object through.
    function safeFill(fill) {
        if (!fill || fill.type !== "pattern" || fill.pattern !== "solid" || !fill.fgColor) return null;
        const color = fill.fgColor;
        if (typeof color.argb === "string" && /^[0-9A-Fa-f]{8}$/.test(color.argb)) {
            return { type: "pattern", pattern: "solid", fgColor: { argb: color.argb.toUpperCase() } };
        }
        if (Number.isInteger(color.theme) && color.theme >= 0 && color.theme <= 11) {
            const themed = { theme: color.theme };
            if (Number.isFinite(color.tint) && Math.abs(color.tint) <= 1) themed.tint = color.tint;
            return { type: "pattern", pattern: "solid", fgColor: themed };
        }
        return null;
    }

    function addTemplateSheet(mainWorkbook, sourceSheet) {
        const templateSheet = mainWorkbook.addWorksheet("Template");
        const rowCount = Math.min(sourceSheet.rowCount, MAX_READ_ROWS);
        const colCount = Math.min(sourceSheet.columnCount, MAX_READ_COLUMNS);

        for (let r = 1; r <= rowCount; r += 1) {
            const values = [];
            for (let c = 1; c <= colCount; c += 1) {
                values.push(templateCellValue(sourceSheet.getCell(r, c).value));
            }
            templateSheet.addRow(values);
        }

        for (let r = 1; r <= rowCount; r += 1) {
            for (let c = 1; c <= colCount; c += 1) {
                const fill = safeFill(sourceSheet.getCell(r, c).fill);
                if (fill) templateSheet.getCell(r, c).fill = fill;
            }
        }
    }

    function addTemplateSheetFromGrid(mainWorkbook, grid) {
        const templateSheet = mainWorkbook.addWorksheet("Template");
        grid.forEach((row) => templateSheet.addRow(row));
    }

    // ----- Blank downloadable template -----

    function buildBlankTemplateWorkbook(weekCount) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Template");

        sheet.getCell(1, 1).value =
            "Shift Rotation Template: type one name per cell under the days that person works. Each row is one week.";
        sheet.getCell(1, 1).font = STYLES.fontDay;

        const headerRow = 2;
        BLANK_TEMPLATE_GROUPS.forEach((label, gi) => {
            const startCol = gi * 8 + 1;
            const labelCell = sheet.getCell(headerRow, startCol);
            labelCell.value = label;
            labelCell.font = STYLES.fontDay;
            BLANK_TEMPLATE_DAY_HEADERS.forEach((day, di) => {
                const dayCell = sheet.getCell(headerRow, startCol + 1 + di);
                dayCell.value = day;
                dayCell.font = STYLES.fontDay;
            });
        });

        for (let w = 0; w < weekCount; w += 1) {
            const row = headerRow + 1 + w;
            BLANK_TEMPLATE_GROUPS.forEach((_, gi) => {
                const startCol = gi * 8 + 1;
                sheet.getCell(row, startCol).value = w + 1;
            });
        }

        for (let c = 1; c <= BLANK_TEMPLATE_GROUPS.length * 8; c += 1) {
            sheet.getColumn(c).width = 12;
        }

        return workbook;
    }

    // ----- Shift group name editor (DOM; all content set via textContent) -----

    function clearGroupEditor() {
        groupsContainer.replaceChildren();
        const placeholder = document.createElement("p");
        placeholder.className = "muted";
        placeholder.textContent = "Your shifts will be listed here once a template is loaded.";
        groupsContainer.appendChild(placeholder);
    }

    function groupMembers(group) {
        const names = new Set();
        group.weeks.forEach((week) => {
            week.forEach((value) => {
                const name = normalizeEmployee(value);
                if (name) names.add(name);
            });
        });
        return Array.from(names).sort();
    }

    function setSwatch(swatch, colorKey) {
        swatch.className = `swatch tone--${colorKeyOrNone(colorKey)}`;
    }

    function renderGroupEditor(shiftGroups) {
        groupsContainer.replaceChildren();

        shiftGroups.forEach((group, gi) => {
            const row = document.createElement("div");
            row.className = "schedule-generator__group-row";

            const members = groupMembers(group);
            const shown = members.slice(0, 4).join(", ");
            const source = document.createElement("p");
            source.className = "muted schedule-generator__group-source";
            source.textContent =
                `From your template: ${group.label ? `"${group.label}"` : "unlabelled shift"}, ` +
                `columns ${group.columnRange}. ` +
                (members.length ? `Includes ${shown}${members.length > 4 ? ", ..." : ""}.` : "No names found.");

            const sentence = document.createElement("div");
            sentence.className = "schedule-generator__group-sentence";

            const input = document.createElement("input");
            input.type = "text";
            input.value = group.shiftLabel;
            input.maxLength = MAX_LABEL_LENGTH;
            input.placeholder = "Shift name";
            input.setAttribute("aria-label", `Name for the shift in columns ${group.columnRange}`);
            input.addEventListener("input", () => {
                group.shiftLabel = input.value;
                renderPreviewIfPossible();
            });

            const connector = document.createElement("span");
            connector.className = "text-strong";
            connector.textContent = "is colored";

            const select = document.createElement("select");
            select.setAttribute("aria-label", `Color for the shift in columns ${group.columnRange}`);
            SHIFT_COLORS.forEach((entry, key) => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = entry.label;
                select.appendChild(option);
            });
            select.value = colorKeyOrNone(group.color);

            const swatch = document.createElement("span");
            swatch.setAttribute("aria-hidden", "true");
            setSwatch(swatch, group.color);

            select.addEventListener("change", () => {
                group.color = colorKeyOrNone(select.value);
                setSwatch(swatch, group.color);
                renderPreviewIfPossible();
            });

            sentence.append(input, connector, select, swatch);
            row.append(source, sentence);
            groupsContainer.appendChild(row);
        });
    }

    // ----- Preview rendering (DOM; all content set via textContent) -----

    function clearPreview() {
        previewContainer.replaceChildren();
        const placeholder = document.createElement("p");
        placeholder.className = "muted";
        placeholder.textContent = "Your preview will appear here once a template is loaded.";
        previewContainer.appendChild(placeholder);
    }

    function renderPreview(monthGrid) {
        const table = document.createElement("table");
        table.className = "schedule-preview__table";

        const caption = document.createElement("caption");
        caption.textContent = monthGrid.title;
        table.appendChild(caption);

        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        orderedDays(monthGrid.calStart).forEach((weekday) => {
            const th = document.createElement("th");
            th.textContent = DOW[weekday].slice(0, 3);
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        monthGrid.cells.forEach((week) => {
            const tr = document.createElement("tr");
            week.forEach((lines) => {
                const td = document.createElement("td");
                (lines || []).forEach((line) => {
                    const div = document.createElement("div");
                    div.textContent = line.text || "\u00a0";
                    const color = line.color ? colorKeyOrNone(line.color) : "none";
                    if (color !== "none") div.className = `schedule-preview__tag tone--${color}`;
                    td.appendChild(div);
                });
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        previewContainer.replaceChildren(table);
    }

    // ----- Filenames / download -----

    function sanitizeFileName(name) {
        const safe = String(name)
            .replace(UNSAFE_TEXT_RE, "")
            .replace(/[\\/:*?"<>|\s]+/g, "_")
            .replace(/^[._]+/, "")
            .slice(0, MAX_FILE_NAME_PART);
        return safe || "employee";
    }

    function formatTimestamp(date) {
        const pad = (n) => String(n).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}`;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    fileNameLabel.textContent = "No file selected.";
    setDefaultDate();
    clearGroupEditor();
    clearPreview();
    updateGenerateAvailability();
})();
