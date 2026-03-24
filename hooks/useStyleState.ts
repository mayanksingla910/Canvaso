import { useCanvasStore } from "@/store/useCanvasStore";
import { DefaultStyles, useToolStore } from "@/store/useToolStore";

export function useCurrentStyle(key: keyof DefaultStyles): unknown {
    const { elements, selectedIds } = useCanvasStore.getState()
    const defaults = useToolStore(s => s.defaultStyles)

    if(selectedIds.length === 0) return defaults[key]

    const selected = selectedIds.map(id => elements[id]).filter(Boolean)

    if(selected.length === 0) return defaults[key]

    const values = selected.map((el) => (el as Record<string, unknown>)[key])

    return values.every(v => v === values[0]) ? values[0] : defaults[key]
}

export function useApplyStyle() {
    const setDefault = useToolStore(s => s.setDefaultStyle)

    return (key: keyof DefaultStyles, value: unknown) => {
        setDefault(key, value)
        useCanvasStore.getState().updateSelected({[key]: value})
    }
}