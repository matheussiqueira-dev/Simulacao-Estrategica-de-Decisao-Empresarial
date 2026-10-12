"use client";

import { ArrowLeft, CodeXml, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react";

import { PORTFOLIO_CASE_URL, REPO_URL } from "../site";

// Appendix A.7, tooltips: open after 300 ms of hover, at once on keyboard focus.
const HOVER_DELAY_MS = 300;

type HeaderLinkProps = {
  href: string;
  label: string;
  Icon: LucideIcon;
  external?: boolean;
};

/**
 * Below 480 px the label turns screen-reader only and the link becomes a 44x44 icon
 * button (Appendix A.9). The tooltip repeats the label for sighted users there; it is
 * aria-hidden because the label already names the link, so nothing is read twice.
 */
function HeaderLink({ href, label, Icon, external = false }: HeaderLinkProps) {
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    if (!open) return;
    // WCAG 1.4.13: Esc dismisses the tooltip without moving the pointer or the focus.
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const close = () => {
    window.clearTimeout(hoverTimer.current);
    setOpen(false);
  };

  const openAfterHover = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(true), HOVER_DELAY_MS);
  };

  const openOnKeyboardFocus = (event: FocusEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.matches(":focus-visible")) setOpen(true);
  };

  return (
    <a
      href={href}
      className="ms-header__link"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onPointerEnter={openAfterHover}
      onPointerLeave={close}
      onFocus={openOnKeyboardFocus}
      onBlur={close}
    >
      <Icon className="ms-header__icon" size={16} strokeWidth={1.75} aria-hidden="true" />
      <span className="max-[480px]:sr-only">{label}</span>
      {external ? <span className="ms-sr-only"> (abre em nova aba)</span> : null}
      <span className="ms-header__tooltip" aria-hidden="true" hidden={!open}>
        {label}
      </span>
    </a>
  );
}

export function HeaderNav() {
  return (
    <nav className="ms-header__nav" aria-label="Projeto">
      <HeaderLink href={PORTFOLIO_CASE_URL} label="Portfólio" Icon={ArrowLeft} />
      <HeaderLink href={REPO_URL} label="Código" Icon={CodeXml} external />
    </nav>
  );
}
