import prisma from "../config/database";
import { VariableKind, VariableContext, DataType } from "@prisma/client";

interface RawVariableSelector {
    css?: string;
    xpath?: string;
    relativeXPath?: string;
}

interface RawVariableContext {
    type?: string;
    rowIndex?: number;
    columnIndex?: number;
    columnHeader?: string;
    formId?: string;
    formName?: string;
    formAction?: string;
    formTitle?: string;
    modalTitle?: string;
    modalId?: string;
    modalRole?: string;
    sidebarTitle?: string;
    sidebarId?: string;
    navbarId?: string;
    sectionTitle?: string;
    cardTitle?: string;
    cardId?: string;
    toolbarId?: string;
    footerId?: string;
    tabTitle?: string;
    tabPanelId?: string;
    dropdownId?: string;
    expanded?: boolean;
}

interface RawVariable {
    name: string;
    kind: string;
    context?: string | RawVariableContext;
    dataType?: string;
    selector?: RawVariableSelector;
    value?: string | number | boolean | null;
    enumValues?: Array<{ value: string; label: string }> | null;
    targetTag?: string;
    inputType?: string;
    pageUrl?: string;
    pageTitle?: string;
    pageName?: string;
}

const DATA_TYPE_MAP: Record<string, DataType> = {
    string: "string",
    text: "text",
    number: "number",
    boolean: "boolean",
    email: "email",
    url: "url",
    phone: "phone",
    date: "date",
    datetime: "datetime",
    time: "time",
    password: "password",
    color: "color",
    file: "file",
    enum_type: "enum_type",
    enum: "enum_type",
};

const CONTEXT_MAP: Record<string, VariableContext> = {
    formField: "formField",
    table: "table",
    modal: "modal",
    sidebar: "sidebar",
    navbar: "navbar",
    accordion: "accordion",
    card: "card",
    toolbar: "toolbar",
    footer: "footer",
    tabPanel: "tabPanel",
    dropdown: "dropdown",
};

function mapContext(ctx: string | RawVariableContext | undefined): VariableContext {
    if (!ctx) return "formField";
    if (typeof ctx === "string") return CONTEXT_MAP[ctx] || "formField";
    if (typeof ctx === "object" && ctx.type) return CONTEXT_MAP[ctx.type] || "formField";
    return "formField";
}

function mapDataType(dt: string | undefined): DataType {
    if (!dt) return "string";
    return DATA_TYPE_MAP[dt] || "string";
}

function mapKind(kind: string | undefined): VariableKind {
    return kind === "output" ? "output" : "input";
}

export async function saveVariables(
    testCaseId: string,
    recordingId: string | null,
    rawVariables: RawVariable[],
) {
    if (!rawVariables?.length) return [];

    const results = [];

    for (const v of rawVariables) {
        const context = mapContext(v.context);
        const dataType = mapDataType(v.dataType);
        const kind = mapKind(v.kind);

        const rawCtx = typeof v.context === "object" ? v.context : null;

        const data = {
            name: v.name,
            kind,
            context,
            dataType,
            selectorCss: v.selector?.css || null,
            selectorXpath: v.selector?.xpath || null,
            selectorRelativeXpath: v.selector?.relativeXPath || null,
            value: v.value != null ? String(v.value) : null,
            tableRowIndex: context === "table" ? (rawCtx?.rowIndex ?? null) : null,
            tableColumnIndex: context === "table" ? (rawCtx?.columnIndex ?? null) : null,
            tableColumnHeader: context === "table" ? (rawCtx?.columnHeader ?? null) : null,
            enumValues: v.enumValues || null,
            targetTag: v.targetTag || null,
            inputType: v.inputType || null,
            pageUrl: v.pageUrl || null,
            pageTitle: v.pageTitle || null,
            pageName: v.pageName || null,
            contextMeta: rawCtx || null,
            testCaseId,
            recordingId: recordingId || null,
        };

        const existing = await prisma.variable.findFirst({
            where: { testCaseId, name: v.name, kind },
        });

        let saved;
        if (existing) {
            saved = await prisma.variable.update({
                where: { id: existing.id },
                data,
            });
        } else {
            saved = await prisma.variable.create({ data });
        }

        results.push(saved);
    }

    return results;
}

export async function getVariablesByTestCase(testCaseId: string) {
    const variables = await prisma.variable.findMany({
        where: { testCaseId },
        orderBy: [{ kind: "asc" }, { createdAt: "asc" }],
    });

    return {
        input: variables.filter((v) => v.kind === "input"),
        output: variables.filter((v) => v.kind === "output"),
        all: variables,
    };
}

export async function getVariablesByContext(testCaseId: string, context: string) {
    const mappedContext = CONTEXT_MAP[context];
    if (!mappedContext) {
        return prisma.variable.findMany({
            where: { testCaseId },
            orderBy: { createdAt: "asc" },
        });
    }
    return prisma.variable.findMany({
        where: { testCaseId, context: mappedContext },
        orderBy: { createdAt: "asc" },
    });
}

export function getOperatorsForDataType(dataType: string): string[] {
    const base = ["equals", "not_equals", "is_empty", "is_not_empty"];

    const operatorMap: Record<string, string[]> = {
        string: [...base, "contains", "starts_with", "ends_with", "matches_regex"],
        text: [...base, "contains", "starts_with", "ends_with", "matches_regex"],
        number: [...base, "greater_than", "less_than", "greater_or_equal", "less_or_equal", "between"],
        boolean: ["equals", "not_equals", "is_true", "is_false"],
        email: [...base, "contains", "matches_regex"],
        url: [...base, "contains", "starts_with"],
        phone: [...base, "contains", "starts_with"],
        date: [...base, "before", "after", "between", "greater_than", "less_than"],
        datetime: [...base, "before", "after", "between", "greater_than", "less_than"],
        time: [...base, "before", "after", "between"],
        password: ["equals", "not_equals", "is_empty", "is_not_empty"],
        color: ["equals", "not_equals"],
        file: ["is_empty", "is_not_empty"],
        enum_type: ["equals", "not_equals", "in_list", "not_in_list"],
    };

    return operatorMap[dataType] || base;
}