import prisma from "../config/database";

interface RawStep {
    type: string;
    selector?: {
        css?: string;
        xpath?: string;
        relativeXPath?: string;
    };
    value?: string | number | boolean | null;
    targetTag?: string;
    timestamp?: number;
    pageUrl?: string;
    pageTitle?: string;
    pageName?: string;
    context?: any;
}

export async function saveSteps(recordingId: string, rawSteps: RawStep[]): Promise<void> {
    if (!rawSteps?.length) return;

    const data = rawSteps.map((step, index) => ({
        type: step.type,
        selectorCss: step.selector?.css || null,
        selectorXpath: step.selector?.xpath || null,
        selectorRelativeXpath: step.selector?.relativeXPath || null,
        value: step.value != null ? String(step.value) : null,
        targetTag: step.targetTag || null,
        timestamp: step.timestamp ? BigInt(step.timestamp) : null,
        stepOrder: index,
        pageUrl: step.pageUrl || null,
        pageTitle: step.pageTitle || null,
        pageName: step.pageName || null,
        contextMeta: step.context || null,
        recordingId,
    }));

    await prisma.step.deleteMany({ where: { recordingId } });
    await prisma.step.createMany({ data });
}

export async function getStepsByRecording(recordingId: string) {
    const steps = await prisma.step.findMany({
        where: { recordingId },
        orderBy: { stepOrder: "asc" },
    });

    return steps.map((step) => ({
        ...step,
        timestamp: step.timestamp ? Number(step.timestamp) : null,
        preferredSelector:
            step.selectorRelativeXpath || step.selectorCss || step.selectorXpath,
        preferredSelectorType: step.selectorRelativeXpath
            ? "relativeXPath"
            : step.selectorCss
                ? "css"
                : "xpath",
    }));
}