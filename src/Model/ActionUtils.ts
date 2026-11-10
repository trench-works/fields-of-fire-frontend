// model/ActionUtils.ts
import { Action } from "./Action";
import { Entity } from "./Entity";

export function getEntityActions(
    entity: Pick<Entity, "actionList" | "modifiedActionList">,
    baseActions: Action[],
): Action[] {
    const modified = new Map((entity.modifiedActionList ?? []).map((a) => [a.id, a]));
    const base = new Map(baseActions.map((a) => [a.id, a]));
    return entity.actionList.flatMap((id) => {
        const action = modified.get(id) ?? base.get(id);
        return action ? [action] : [];
    });
}

export function getEntityAction(
    entity: Pick<Entity, "actionList" | "modifiedActionList">,
    baseActions: Action[],
    id: string,
): Action | undefined {
    return getEntityActions(entity, baseActions).find((a) => a.id === id);
}