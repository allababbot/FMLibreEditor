// The More actions menu of a squad: the actions on the whole team one at a time, Heal all to Max tactics, which Team at
// its best does together, and Batch traits, which opens its dialog. The tab's controls sit in a box that scrolls, which
// would cut a menu off at its edge, so the menu is drawn over the window, under its button (above it where the window
// has no room below). The Recipes button of a player's and a club's profile is the same button and menu, with its own
// name (see `RecipeMenu`).
//
// What an item does is said in a small box beside the menu while the pointer is on the item or the keys have reached
// it: narrow, so that it wraps into a few short lines and fits a small window, where the browser's own hover text would
// be one long strip.

import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { squadText as text } from "./labels";
import type { TeamAction } from "./types";
import { EditorContext } from "./useProfileEditing";

/** The room the menu keeps between itself and its button, and between itself and the edge of the window. */
const GAP = 4;

/** Where the open menu hangs: the window's coordinates of its button, and the element it is drawn in. */
interface Anchor {
  left: number;
  top: number;
  bottom: number;
  /**
   * The dialog the button is in, or else the page: a dialog keeps focus and the keys to itself (see `useModal`), so a
   * menu of a button inside one, such as Recipes in the profile of a player opened from a squad, is drawn inside it.
   */
  host: HTMLElement;
}

/** What an item of the menu does: one of the actions on the team, or Batch traits, which opens its dialog. */
export type MenuItemAction = TeamAction | "batchTraits";

/** One action of the menu, as its button in the row would have shown it. */
export interface MenuAction<A extends string = MenuItemAction> {
  action: A;
  label: string;
  /** Its note, shown beside the menu: what it does, or why it waits. Kept short. */
  title: string;
  /** Whether there is nothing it can do now: the item is dimmed, and says why. */
  waiting: boolean;
  /** Whether it opens a dialog first rather than writing at once. */
  dialog?: boolean;
}

interface TeamActionMenuProps<A extends string> {
  actions: readonly MenuAction<A>[];
  /** Whether the game can be written to: without it the button is disabled, and says why. */
  editable: boolean;
  /** Whether a write is under way: the menu waits for it. */
  busy: boolean;
  onPick: (action: A) => void;
  /** The More actions button, which takes focus back once a dialog one of its items opened is closed. */
  buttonRef?: Ref<HTMLButtonElement>;
  /** The button's name and hover text, and its classes, where it is not the squad's More actions. */
  label?: string;
  title?: string;
  className?: string;
}

/** The More actions button and, once it is pressed, its menu. */
export function TeamActionMenu<A extends string = MenuItemAction>(props: TeamActionMenuProps<A>) {
  const { actions, editable, busy, onPick, buttonRef } = props;
  const { label = text.moreActions, title = text.moreActionsTitle, className = "squad-action squad-more" } = props;
  const { readOnlyNote } = useContext(EditorContext);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const menu = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLDivElement>(null);
  const noteId = useId();
  // The item the pointer is on, and the one the keys have reached: the note is the pointer's item's first.
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  // Whether the keys opened the menu or have moved through it: only then does the item with focus show its note. The
  // menu keeps this itself rather than asking `:focus-visible`, which WebKit (the Mac's web view) gives the first item
  // as the menu focuses it on opening after a click, where Chromium does not.
  const keyed = useRef(false);
  const open = anchor !== null;
  const at = open ? (hovered ?? focused) : null;
  const noted = at !== null && actions[at]?.title ? at : null;

  // The button is the menu's own, and the squad's too where it asks for it.
  const setButton = useCallback(
    (node: HTMLButtonElement | null) => {
      button.current = node;
      if (typeof buttonRef === "function") {
        buttonRef(node);
      } else if (buttonRef) {
        buttonRef.current = node;
      }
    },
    [buttonRef],
  );

  const show = () => {
    const box = button.current?.getBoundingClientRect();
    if (box) {
      const host = button.current?.closest<HTMLElement>('[aria-modal="true"]') ?? document.body;
      setAnchor({ left: box.left, top: box.top, bottom: box.bottom, host });
    }
  };

  const close = (refocus: boolean) => {
    setAnchor(null);
    if (refocus) {
      button.current?.focus();
    }
  };

  // Once the menu is on screen it moves above its button if it would run off the bottom of the window, and left if it
  // would run off its right edge; then its first item takes focus.
  useLayoutEffect(() => {
    const list = menu.current;
    if (anchor === null || list === null) {
      return;
    }
    const { height, width } = list.getBoundingClientRect();
    if (anchor.bottom + GAP + height > window.innerHeight - GAP) {
      list.style.top = `${Math.max(GAP, anchor.top - GAP - height)}px`;
    }
    const room = document.documentElement.clientWidth - GAP;
    if (anchor.left + width > room) {
      list.style.left = `${Math.max(GAP, room - width)}px`;
    }
    list.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [anchor]);

  // The note hangs beside its item: right of the menu, left of it where the window has no room there, and under the
  // menu (over it at the foot of the window) where it has room on neither side.
  useLayoutEffect(() => {
    const list = menu.current;
    const tip = note.current;
    const item = noted === null ? undefined : list?.querySelectorAll<HTMLElement>('[role="menuitem"]')[noted];
    if (!list || !tip || !item) {
      return;
    }
    const box = list.getBoundingClientRect();
    const { width, height } = tip.getBoundingClientRect();
    const right = document.documentElement.clientWidth - GAP;
    const bottom = window.innerHeight - GAP;
    let left = box.right + GAP;
    let top = item.getBoundingClientRect().top;
    if (left + width > right) {
      left = box.left - GAP - width;
    }
    if (left < GAP) {
      left = Math.max(GAP, Math.min(box.left, right - width));
      top = box.bottom + GAP + height <= bottom ? box.bottom + GAP : box.top - GAP - height;
    }
    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(Math.max(GAP, Math.min(top, bottom - height)))}px`;
  }, [noted, anchor]);

  // A menu that closes forgets where the pointer and the keys were.
  useEffect(() => {
    if (!open) {
      setHovered(null);
      setFocused(null);
    }
  }, [open]);

  // A press elsewhere closes it, and so does a scroll or a resize: the button moves with the page, the menu does not.
  useEffect(() => {
    if (!open) {
      return;
    }
    const pressed = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && (menu.current?.contains(target) || button.current?.contains(target))) {
        return;
      }
      setAnchor(null);
    };
    const hide = () => setAnchor(null);
    document.addEventListener("pointerdown", pressed, true);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("pointerdown", pressed, true);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [open]);

  // A write that starts while it is open (from another control) closes it: its items would act on numbers out of date.
  useEffect(() => {
    if (busy) {
      setAnchor(null);
    }
  }, [busy]);

  const pick = (item: MenuAction<A>) => {
    if (item.waiting) {
      return;
    }
    close(true);
    onPick(item.action);
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const at = items.findIndex((item) => item === document.activeElement);
    let next: HTMLElement | undefined;
    switch (event.key) {
      case "ArrowDown":
        next = items[(at + 1) % items.length];
        break;
      case "ArrowUp":
        next = items[(at - 1 + items.length) % items.length];
        break;
      case "Home":
        next = items[0];
        break;
      case "End":
        next = items[items.length - 1];
        break;
      case "Escape":
        // A profile behind closes on Escape too: this one is the menu's.
        event.stopPropagation();
        event.preventDefault();
        close(true);
        return;
      case "Tab":
        // Tab leaves the menu for the controls after its button.
        close(true);
        return;
      default:
        return;
    }
    event.preventDefault();
    keyed.current = true;
    next?.focus();
  };

  return (
    <>
      <button
        ref={setButton}
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        // While a write is under way the button is only dimmed (aria-disabled): a disabled button loses focus.
        aria-disabled={busy || undefined}
        disabled={!editable}
        title={editable ? title : readOnlyNote}
        onClick={(event) => {
          if (open) {
            setAnchor(null);
          } else if (!busy) {
            // A click that counts no presses is Enter or Space on the button.
            keyed.current = event.detail === 0;
            show();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open && !busy) {
            event.preventDefault();
            keyed.current = true;
            show();
          }
        }}
      >
        <span>{label}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5.5 8l4.5 4.5L14.5 8" />
        </svg>
      </button>
      {anchor !== null &&
        createPortal(
          <>
            <div
              ref={menu}
              className="squad-menu squad-actions-menu"
              role="menu"
              // Escape is the menu's: a dialog around it stays open.
              data-takes-escape
              aria-label={label}
              style={{ top: anchor.bottom + GAP, left: anchor.left }}
              onKeyDown={keyDown}
            >
              {actions.map((item, index) => (
                <button
                  key={item.action}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  // Dimmed, not disabled: the keys still reach it, and its note says why it waits.
                  aria-disabled={item.waiting || undefined}
                  aria-haspopup={item.dialog ? "dialog" : undefined}
                  aria-describedby={noted === index ? noteId : undefined}
                  onClick={() => pick(item)}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered((now) => (now === index ? null : now))}
                  // The menu focuses its first item when it opens: opened by a click, that shows no note by itself.
                  onFocus={() => setFocused(keyed.current ? index : null)}
                  onBlur={() => setFocused((now) => (now === index ? null : now))}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {noted !== null && (
              <div ref={note} id={noteId} role="tooltip" className="menu-note">
                {actions[noted].title}
              </div>
            )}
          </>,
          anchor.host,
        )}
    </>
  );
}
