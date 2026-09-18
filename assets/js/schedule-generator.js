(function () {
    "use strict";

    const fileInput = document.getElementById("sched-file");
    const pasteInput = document.getElementById("sched-paste");
    const pasteParseButton = document.getElementById("sched-paste-parse");
    const weekInput = document.getElementById("sched-week");
    const monthInput = document.getElementById("sched-month");
    const yearInput = document.getElementById("sched-year");
    const generateButton = document.getElementById("sched-generate");
    const clearButton = document.getElementById("sched-clear");
    const status = document.getElementById("sched-status");
    const fileNameLabel = document.getElementById("sched-filename");
    const summary = document.getElementById("sched-summary");
    const groupsContainer = document.getElementById("sched-groups");
    const previewContainer = document.getElementById("sched-preview");
    const templateWeeksInput = document.getElementById("sched-template-weeks");
    const downloadTemplateButton = document.getElementById("sched-download-template");

    const requiredEls = [
        fileInput, pasteInput, pasteParseButton, weekInput, monthInput, yearInput, generateButton, clearButton,
        status, fileNameLabel, summary, groupsContainer, previewContainer, templateWeeksInput, downloadTemplateButton
    ];
    if (requiredEls.some((el) => !el)) return;

    if (typeof ExcelJS === "undefined" || typeof JSZip === "undefined") {
        status.textContent = "This tool could not load its dependencies. Please reload the page.";
        generateButton.disabled = true;
        downloadTemplateButton.disabled = true;
        return;
    }

    // ----- Output calendar layout (fixed: a Mon-Sun printed calendar) -----
    const COLS_PER_WEEK = 14;
    const DATA_START_ROW = 4;
    const HEADER_ROW = 3;
    const TITLE_ROWS = 2;
    const COL_WIDTH = 16;
    const ROW_HEIGHT_BASE = 25;
    const ROW_HEIGHT_PER_LINE = 13;
    const NUM_MONTHS = 12;

    const DOW = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // ----- Input template detection (dynamic, so the template can grow) -----
    // Day names are matched by pattern, in any column order, so a Sunday-first or
    // Monday-first header (and short "Su"/"Mo" or long "Sun"/"Mon" abbreviations) both work.
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
        },
        dayFill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } },
        nightFill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFADADAD" } }
    };

    let selectedFile = null;
    // parsedModel: { source: {kind:"workbook", sourceWorksheet} | {kind:"pasted", grid}, shiftGroups, weekCount, employees }
    let parsedModel = null;
    let busy = false;

    class UserFacingError extends Error {}

    function setStatus(message) {
        status.textContent = message;
    }

    function updateGenerateAvailability() {
        generateButton.disabled = busy || !parsedModel;
    }

    fileInput.addEventListener("change", () => {
        void handleFileSelected();
    });

    pasteParseButton.addEventListener("click", () => {
        void handlePasteParse();
    });

    [weekInput, monthInput, yearInput].forEach((el) => {
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
        monthInput.value = "";
        yearInput.value = "";
        setStatus("");
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
        clearPreview();
        clearGroupEditor();
        weekInput.removeAttribute("max");
        updateGenerateAvailability();
    }

    function buildParsedModelFromGrid(grid, source) {
        const { shiftGroups, weekCount } = preProcessTemplate(grid);
        const employees = extractEmployees(shiftGroups);
        return { source, shiftGroups, weekCount, employees };
    }

    function applyParsedModel(model) {
        parsedModel = model;

        weekInput.max = String(model.weekCount);
        if (!weekInput.value || Number(weekInput.value) > model.weekCount) {
            weekInput.value = "1";
        }
        if (!monthInput.value) monthInput.value = String(new Date().getMonth() + 1);
        if (!yearInput.value) yearInput.value = String(new Date().getFullYear());

        renderGroupEditor(model.shiftGroups);

        const employeeNote = model.employees.length
            ? model.employees.slice(0, MAX_PREVIEW_EMPLOYEES).join(", ") +
              (model.employees.length > MAX_PREVIEW_EMPLOYEES
                  ? `, +${model.employees.length - MAX_PREVIEW_EMPLOYEES} more`
                  : "")
            : "none found";
        summary.textContent =
            `Detected ${model.shiftGroups.length} shift group(s) across ${model.weekCount} rotation week(s). ` +
            `Employees: ${employeeNote}.`;

        setStatus("Template parsed. Review the shift names below, adjust the starting week/month/year to preview, then generate.");
        renderPreviewIfPossible();
    }

    async function handleFileSelected() {
        const file = fileInput.files && fileInput.files[0];
        selectedFile = file || null;
        resetParsedState();

        if (!file) {
            fileNameLabel.textContent = "No file selected.";
            setStatus("");
            return;
        }

        fileNameLabel.textContent = file.name;
        pasteInput.value = "";
        setStatus("Reading template...");

        try {
            const buffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const sourceWorksheet = workbook.worksheets[0];
            if (!sourceWorksheet) {
                throw new UserFacingError("The uploaded file has no worksheets.");
            }

            const grid = readGrid(sourceWorksheet);
            const model = buildParsedModelFromGrid(grid, { kind: "workbook", sourceWorksheet });
            applyParsedModel(model);
        } catch (error) {
            parsedModel = null;
            if (error instanceof UserFacingError) {
                setStatus(error.message);
            } else {
                console.error(error);
                setStatus("Could not read that file. Check that it matches the expected template layout.");
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
            setStatus("Paste some tab-separated shift data first.");
            return;
        }

        fileInput.value = "";
        fileNameLabel.textContent = "No file selected.";
        setStatus("Reading pasted data...");

        try {
            const grid = parsePastedGrid(text);
            const model = buildParsedModelFromGrid(grid, { kind: "pasted", grid });
            applyParsedModel(model);
        } catch (error) {
            parsedModel = null;
            if (error instanceof UserFacingError) {
                setStatus(error.message);
            } else {
                console.error(error);
                setStatus("Could not read that pasted data. Check that it matches the expected template layout.");
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

        const grid = computeMainMonthGrid(parsedModel.shiftGroups, parsedModel.weekCount, week, month, year);
        renderPreview(grid);
    }

    async function handleGenerate() {
        if (busy || !parsedModel) return;

        const params = readInputs(parsedModel.weekCount);
        if (!params.valid) {
            setStatus(params.message);
            return;
        }

        busy = true;
        updateGenerateAvailability();
        setStatus("Generating schedule...");

        try {
            const { source, shiftGroups, weekCount, employees } = parsedModel;

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
                week = createMonthSheets(mainWorkbook, employeeWorkbooks, shiftGroups, weekCount, week, month, year);
                month += 1;
            }

            setStatus("Packaging files...");

            const timestamp = formatTimestamp(new Date());
            const zip = new JSZip();

            const mainBuffer = await mainWorkbook.xlsx.writeBuffer();
            zip.file(`Schedule_${timestamp}.xlsx`, mainBuffer);

            for (const [name, wb] of employeeWorkbooks.entries()) {
                const empBuffer = await wb.xlsx.writeBuffer();
                zip.file(`Schedule_Employee_${sanitizeFileName(name)}_${timestamp}.xlsx`, empBuffer);
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            downloadBlob(zipBlob, `Schedules_${timestamp}.zip`);

            const employeeNote = employees.length
                ? ` and ${employees.length} employee schedule${employees.length === 1 ? "" : "s"}`
                : "";
            setStatus(`Done. Downloaded a zip with the ${NUM_MONTHS}-month schedule${employeeNote}. All processing happened in your browser.`);
        } catch (error) {
            if (error instanceof UserFacingError) {
                setStatus(error.message);
            } else {
                console.error(error);
                setStatus("Could not generate a schedule from that file. Check that it matches the expected template layout.");
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
            setStatus("Could not build a template file.");
        }
    }

    function readInputs(weekCount) {
        const week = Number.parseInt(weekInput.value, 10);
        const month = Number.parseInt(monthInput.value, 10);
        const year = Number.parseInt(yearInput.value, 10);

        if (!Number.isInteger(week) || week < 1 || week > weekCount) {
            return { valid: false, message: `Starting template week must be between 1 and ${weekCount}.` };
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            return { valid: false, message: "Starting month must be between 1 and 12." };
        }
        if (!Number.isInteger(year) || year < 1900 || year > 2400) {
            return { valid: false, message: "Starting year must be between 1900 and 2400." };
        }

        return { valid: true, week, month, year };
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
        for (let r = 1; r < raw.length; r += 1) {
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
        const employee = String(value).trim();
        if (!employee) return null;
        const lower = employee.toLowerCase();
        if (lower === "nan" || lower === "none" || lower === "x") return null;
        return employee.charAt(0).toUpperCase() + employee.slice(1).toLowerCase();
    }

    // ----- Dynamic template structure detection -----

    function deriveShiftLabel(headerText) {
        let s = String(headerText).trim();
        s = s.replace(/\s*\d+\s*$/, "").trim();
        if (s.length > 3 && /s$/i.test(s)) s = s.slice(0, -1);
        return s || String(headerText).trim();
    }

    function computeDefaultShiftLabel(label, index, total) {
        if (label) return deriveShiftLabel(label);
        return index === total - 1 ? "Night" : "Day";
    }

    function effectiveShiftLabel(group, index) {
        const trimmed = group.shiftLabel ? String(group.shiftLabel).trim() : "";
        return trimmed || `Shift ${index + 1}`;
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

    // A "group" is a label column (may be blank in the header; some templates only
    // put a week number there in data rows) immediately followed by 7 columns whose
    // header text names each day of the week, in any order.
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
                    ? String(labelCell).trim()
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
                "Could not find a shift header row (7 columns naming Mon..Sun, in any order). Check the template layout."
            );
        }
        const { rowIndex: headerRowIndex, groups } = header;
        const weekCount = detectWeekCount(grid, headerRowIndex);
        if (weekCount === 0) {
            throw new UserFacingError("No shift-rotation weeks were found under the header row.");
        }

        // All groups are assumed to share the same day order as the first one detected.
        const filePositionForWeekday = new Array(7);
        groups[0].dayOrder.forEach((weekdayIdx, filePos) => {
            filePositionForWeekday[weekdayIdx] = filePos;
        });

        const shiftGroups = groups.map((g, gi) => ({
            label: g.label,
            labelCol: g.labelCol,
            columnRange: `${colLetter(g.labelCol + 1)}–${colLetter(g.labelCol + 8)}`,
            shiftLabel: computeDefaultShiftLabel(g.label, gi, groups.length),
            weeks: []
        }));

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

        return { shiftGroups, weekCount, headerRowIndex };
    }

    // ----- Free-text paste input (tab- or comma-separated, e.g. copied from Excel) -----

    function parsePastedGrid(text) {
        const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        let lines = normalized.split("\n");
        while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
        if (lines.length === 0) {
            throw new UserFacingError("No data found in the pasted text.");
        }
        if (lines.length > MAX_PASTE_LINES) lines = lines.slice(0, MAX_PASTE_LINES);

        const delimiter = normalized.includes("\t") ? "\t" : ",";
        return lines.map((line) => line.split(delimiter).map((cell) => {
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

    function buildMainShiftText(date, assignments, isSunday, weekNumber) {
        let text;
        const dayAssignments = assignments.filter((a) => a.shiftLabel.toLowerCase() === "day");
        const nightAssignments = assignments.filter((a) => a.shiftLabel.toLowerCase() === "night");

        if (assignments.length === 2 && dayAssignments.length === 1 && nightAssignments.length === 1) {
            text = `${date}\n${dayAssignments[0].emp} - ${dayAssignments[0].shiftLabel}\n\n${nightAssignments[0].emp} - ${nightAssignments[0].shiftLabel}`;
        } else {
            text = `${date}`;
            if (assignments.length > 0) {
                text += `\n${assignments.map((a) => `${a.emp} - ${a.shiftLabel}`).join("\n")}`;
            }
        }

        if (isSunday) text += `\nTemplate Week ${weekNumber}`;
        return text;
    }

    function buildEmployeeShiftText(date, assignments, isSunday, weekNumber, targetEmp) {
        const matches = assignments.filter((a) => a.emp === targetEmp);
        if (matches.length === 0) {
            if (isSunday) return [`Template Week ${weekNumber}`, null];
            return [" ", null];
        }
        let text = `${date}\n${matches.map((a) => `${a.emp} - ${a.shiftLabel}`).join("\n")}`;
        if (isSunday) text += `\nTemplate Week ${weekNumber}`;
        return [text, matches[matches.length - 1].shiftLabel];
    }

    function assignmentsFor(shiftGroups, weekIdx, day) {
        const assignments = [];
        shiftGroups.forEach((group, gi) => {
            const emp = normalizeEmployee(group.weeks[weekIdx][day]);
            if (emp) assignments.push({ emp, shiftLabel: effectiveShiftLabel(group, gi) });
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

    function computeMainMonthGrid(shiftGroups, weekCount, weekNumberIn, month, year) {
        let weekNumber = weekNumberIn;
        const title = `${MONTH_NAMES[month - 1]} ${year}`;
        const monthStartDay = firstWeekdayMondayBased(year, month);
        const monthLength = daysInMonth(year, month);
        const weeksInMonth = Math.ceil((monthStartDay + monthLength) / 7);

        const cells = [];
        for (let w = 0; w < weeksInMonth; w += 1) cells.push(new Array(7).fill(null));

        let date = 1;
        let templateDay = monthStartDay;
        for (let week = 0; week < weeksInMonth; week += 1) {
            for (let day = 0; day < 7; day += 1) {
                if (week === 0 && day < monthStartDay) continue;
                if (date > monthLength) break;

                const assignments = assignmentsFor(shiftGroups, weekNumber - 1, templateDay);
                cells[week][day] = buildMainShiftText(date, assignments, day === 6, weekNumber);

                date += 1;
                templateDay += 1;
                if (templateDay > 6) {
                    templateDay = 0;
                    weekNumber += 1;
                    if (weekNumber > weekCount) weekNumber = 1;
                }
            }
        }

        return { title, weeksInMonth, monthStartDay, cells };
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

    function applyHeaders(sheet) {
        DOW.forEach((day, i) => {
            const col = i * 2 + 1;
            sheet.mergeCells(HEADER_ROW, col, HEADER_ROW, col + 1);
            const cell = sheet.getCell(HEADER_ROW, col);
            cell.value = day;
            cell.font = STYLES.fontDay;
            cell.alignment = STYLES.alignCenter;
        });
    }

    function writeShiftCell(sheet, row, col, value, fillLabel) {
        sheet.mergeCells(row, col, row, col + 1);
        const cell = sheet.getCell(row, col);
        cell.value = value;
        cell.alignment = STYLES.alignTopLeft;
        cell.font = STYLES.fontCell;
        cell.border = STYLES.thinBorder;
        const label = fillLabel ? fillLabel.toLowerCase() : null;
        if (label === "day") cell.fill = STYLES.dayFill;
        else if (label === "night") cell.fill = STYLES.nightFill;
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

    function createMonthSheets(mainWorkbook, employeeWorkbooks, shiftGroups, weekCount, weekNumberIn, month, year) {
        let weekNumber = weekNumberIn;
        const title = `${MONTH_NAMES[month - 1]} ${year}`;
        const mainSheet = mainWorkbook.addWorksheet(title);

        const employeeSheets = new Map();
        for (const [name, wb] of employeeWorkbooks.entries()) {
            employeeSheets.set(name, wb.addWorksheet(title));
        }

        const monthStartDay = firstWeekdayMondayBased(year, month);
        const monthLength = daysInMonth(year, month);
        const weeksInMonth = Math.ceil((monthStartDay + monthLength) / 7);

        applyTitle(mainSheet, title);
        applyHeaders(mainSheet);
        for (const sheet of employeeSheets.values()) {
            applyTitle(sheet, title);
            applyHeaders(sheet);
        }

        let date = 1;
        let templateDay = monthStartDay;

        for (let week = 0; week < weeksInMonth; week += 1) {
            for (let day = 0; day < 7; day += 1) {
                const col = day * 2 + 1;
                if (week === 0 && day < monthStartDay) continue;
                if (date > monthLength) break;

                const assignments = assignmentsFor(shiftGroups, weekNumber - 1, templateDay);
                const mainText = buildMainShiftText(date, assignments, day === 6, weekNumber);
                writeShiftCell(mainSheet, DATA_START_ROW + week, col, mainText);

                for (const [name, sheet] of employeeSheets.entries()) {
                    const [empText, shiftLabel] = buildEmployeeShiftText(date, assignments, day === 6, weekNumber, name);
                    writeShiftCell(sheet, DATA_START_ROW + week, col, empText, shiftLabel);
                }

                date += 1;
                templateDay += 1;
                if (templateDay > 6) {
                    templateDay = 0;
                    weekNumber += 1;
                    if (weekNumber > weekCount) weekNumber = 1;
                }
            }
        }

        formatSheet(mainSheet, weeksInMonth);
        for (const sheet of employeeSheets.values()) {
            formatSheet(sheet, weeksInMonth);
        }

        return weekNumber;
    }

    function templateCellValue(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "object") {
            if (value instanceof Date) return value;
            if (typeof value.text === "string") return value.text;
            if (value.richText) return value.richText.map((part) => part.text).join("");
            if ("result" in value) return templateCellValue(value.result);
            return null;
        }
        return value;
    }

    function addTemplateSheet(mainWorkbook, sourceSheet) {
        const templateSheet = mainWorkbook.addWorksheet("Template");
        const rowCount = sourceSheet.rowCount;
        const colCount = sourceSheet.columnCount;

        for (let r = 1; r <= rowCount; r += 1) {
            const values = [];
            for (let c = 1; c <= colCount; c += 1) {
                values.push(templateCellValue(sourceSheet.getCell(r, c).value));
            }
            templateSheet.addRow(values);
        }

        for (let r = 1; r <= rowCount; r += 1) {
            for (let c = 1; c <= colCount; c += 1) {
                const sourceFill = sourceSheet.getCell(r, c).fill;
                if (sourceFill && sourceFill.type) {
                    templateSheet.getCell(r, c).fill = JSON.parse(JSON.stringify(sourceFill));
                }
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

        sheet.getCell(1, 1).value = "Shift Rotation Template";
        sheet.getCell(1, 1).font = STYLES.fontMonth;

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
        placeholder.textContent = "Shift group names will appear here after you upload or paste a template.";
        groupsContainer.appendChild(placeholder);
    }

    function renderGroupEditor(shiftGroups) {
        groupsContainer.replaceChildren();

        shiftGroups.forEach((group, gi) => {
            const row = document.createElement("div");
            row.className = "schedule-generator__group-row";

            const meta = document.createElement("span");
            meta.className = "muted schedule-generator__group-meta";
            meta.textContent = group.label
                ? `Columns ${group.columnRange} (found "${group.label}")`
                : `Columns ${group.columnRange} (no label found)`;

            const input = document.createElement("input");
            input.type = "text";
            input.value = group.shiftLabel;
            input.maxLength = 40;
            input.setAttribute("aria-label", `Shift name for columns ${group.columnRange}`);
            input.addEventListener("input", () => {
                group.shiftLabel = input.value;
                renderPreviewIfPossible();
            });

            row.appendChild(meta);
            row.appendChild(input);
            groupsContainer.appendChild(row);
        });
    }

    // ----- Preview rendering (DOM; all content set via textContent) -----

    function clearPreview() {
        previewContainer.replaceChildren();
        const placeholder = document.createElement("p");
        placeholder.className = "muted";
        placeholder.textContent = "Upload a template to preview a generated month here.";
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
        DOW.forEach((day) => {
            const th = document.createElement("th");
            th.textContent = day.slice(0, 3);
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        monthGrid.cells.forEach((week) => {
            const tr = document.createElement("tr");
            week.forEach((text) => {
                const td = document.createElement("td");
                if (text) {
                    text.split("\n").forEach((line, i) => {
                        if (i > 0) td.appendChild(document.createElement("br"));
                        td.appendChild(document.createTextNode(line));
                    });
                    const lower = text.toLowerCase();
                    if (lower.includes(" - day")) td.classList.add("schedule-preview__cell--day");
                    if (lower.includes(" - night")) td.classList.add("schedule-preview__cell--night");
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        previewContainer.replaceChildren(table);
    }

    // ----- Filenames / download -----

    function sanitizeFileName(name) {
        return name.replace(/[\\/:*?"<>|\s]+/g, "_");
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
    clearGroupEditor();
    clearPreview();
    updateGenerateAvailability();
})();
