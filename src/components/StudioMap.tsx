"use client";

/**
 * 오붓 맞춤 스튜디오 지도 — 네이버 지도 v3 (오붓 앱 지도와 같은 느낌).
 * - NEXT_PUBLIC_NAVER_MAP_CLIENT_ID (NCP Maps 의 ncpKeyId) 필요.
 *   NCP 콘솔에서 이 서비스 도메인(vercel)을 Web 서비스 URL 로 등록해야 지도가 뜹니다.
 * - 키가 없거나 로드에 실패하면 onUnavailable 을 불러 목록 UI 로 대체합니다.
 */

import { useEffect, useRef } from "react";
import type { Studio } from "@/lib/studios/areas";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    naver?: any;
  }
}

const KEY = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
let loader: Promise<any> | null = null;

function loadNaver(): Promise<any> {
  if (window.naver?.maps) return Promise.resolve(window.naver);
  if (!KEY) return Promise.reject(new Error("no key"));
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${KEY}`;
      s.async = true;
      s.onload = () =>
        window.naver?.maps ? resolve(window.naver) : reject(new Error("no maps"));
      s.onerror = () => {
        loader = null;
        reject(new Error("load failed"));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

export const NAVER_MAP_ENABLED = Boolean(KEY);

function escapeHtml(t: string) {
  return t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function pinHtml(title: string, active: boolean) {
  const bg = active ? "#1f3a2b" : "#ffffff";
  const fg = active ? "#ffffff" : "#1d2420";
  const dot = active ? "#1f3a2b" : "#2f4a3a";
  const label = escapeHtml(title.length > 12 ? `${title.slice(0, 12)}…` : title);
  return `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer">
    <div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${dot};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>
    <div style="margin-top:4px;padding:3px 8px;border-radius:8px;background:${bg};color:${fg};font:700 12px/1.3 'Noto Sans KR',sans-serif;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25)">${label}</div>
  </div>`;
}

export default function StudioMap({
  center,
  studios,
  selected,
  onSelect,
  onUnavailable,
}: {
  center: { lat: number; lng: number };
  studios: Studio[];
  selected: string | null;
  onSelect: (slug: string) => void;
  onUnavailable: () => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);

  // 지도 생성 (최초 1회)
  useEffect(() => {
    let cancelled = false;
    loadNaver()
      .then((naver) => {
        if (cancelled || !el.current || map.current) return;
        map.current = new naver.maps.Map(el.current, {
          center: new naver.maps.LatLng(center.lat, center.lng),
          zoom: 13,
          scaleControl: false,
          mapDataControl: false,
          logoControlOptions: { position: naver.maps.Position.BOTTOM_RIGHT },
        });
      })
      .catch(() => !cancelled && onUnavailable());
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스튜디오/선택이 바뀌면 마커 다시 그림
  useEffect(() => {
    const naver = window.naver;
    if (!naver?.maps || !map.current) return;
    markers.current.forEach((m) => m.setMap(null));
    markers.current = studios.map((s) => {
      const m = new naver.maps.Marker({
        position: new naver.maps.LatLng(s.lat, s.lng),
        map: map.current,
        icon: { content: pinHtml(s.title, s.slug === selected) },
        zIndex: s.slug === selected ? 100 : 1,
      });
      naver.maps.Event.addListener(m, "click", () => onSelect(s.slug));
      return m;
    });
  }, [studios, selected, onSelect]);

  // 지역/결과가 바뀌면 화면 맞추기
  useEffect(() => {
    const naver = window.naver;
    if (!naver?.maps || !map.current) return;
    if (studios.length === 0) {
      map.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
      map.current.setZoom(13);
      return;
    }
    const b = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(studios[0].lat, studios[0].lng),
      new naver.maps.LatLng(studios[0].lat, studios[0].lng),
    );
    studios.forEach((s) => b.extend(new naver.maps.LatLng(s.lat, s.lng)));
    map.current.fitBounds(b, { top: 50, right: 40, bottom: 130, left: 40 });
  }, [studios, center.lat, center.lng]);

  return <div ref={el} className="studio-map" aria-label="스튜디오 지도" />;
}
