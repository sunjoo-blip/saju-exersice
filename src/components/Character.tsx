/**
 * 운동팔자 캐릭터 — 3D 토이 스타일 동물 10종 × 운동 16종 장면 160개.
 * 이미지: public/characters/<동물>/<운동>.webp (12프레임 반복) · .png (공유 카드용 정지 컷)
 * - name: 캐릭터 (기린·고양이·사자·여우·곰·다람쥐·토끼·학·돌고래·거북이)
 * - exercise: 운동. 없거나 그 동물의 장면이 없으면 기본 포즈(idle).
 *   → 잠금 상태에서는 exercise 를 넘기지 않아 1위 운동이 그림으로 새지 않게 함.
 * - animated=false: 고해상도 정지 PNG 640px (공유 카드 캡처·도감용, 픽셀 확대 없이 부드럽게)
 */

import type { Exercise } from "@/lib/exercise/catalog";

export const ANIMAL_KEY: Record<string, string> = {
  기린: "giraffe",
  고양이: "cat",
  사자: "lion",
  여우: "fox",
  곰: "bear",
  다람쥐: "squirrel",
  토끼: "rabbit",
  학: "crane",
  돌고래: "dolphin",
  거북이: "turtle",
};

export const EXERCISE_SLUG: Record<Exercise, string> = {
  바레: "barre",
  스피닝: "spinning",
  싱잉볼: "singingbowl",
  요가: "yoga",
  필라테스: "pilates",
  "번지 피트니스": "bungee",
  클라이밍: "climbing",
  "플라잉 요가": "aerial",
  "F45/FS8": "f45",
  GYM: "gym",
  복싱: "boxing",
  크로스핏: "crossfit",
  "하이록스 공식": "hyrox",
  SNPE: "snpe",
  "그룹 트레이닝": "group",
  발레: "ballet",
};

/** 이 동물이 이 운동을 하는 장면이 있는지 */
export function hasScene(name: string, exercise?: string): boolean {
  const key = ANIMAL_KEY[name];
  const slug = exercise ? EXERCISE_SLUG[exercise as Exercise] : undefined;
  return !!key && !!slug;
}

/** 이미지 경로. 장면이 없으면 기본 포즈. */
export function characterSrc(name: string, exercise?: string, animated = true): string | null {
  const key = ANIMAL_KEY[name];
  if (!key) return null;
  const slug = hasScene(name, exercise) ? EXERCISE_SLUG[exercise as Exercise] : "idle";
  return `/characters/${key}/${slug}.${animated ? "webp" : "png"}`;
}

export default function Character({
  name,
  exercise,
  size = 240,
  animated = true,
  className,
}: {
  name: string;
  exercise?: string;
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const src = characterSrc(name, exercise, animated);
  if (!src) return null;
  const label = hasScene(name, exercise) ? `${exercise}하는 ${name}` : name;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`toy-char${animated ? "" : " toy-still"}${className ? ` ${className}` : ""}`}
      src={src}
      alt={label}
      width={size}
      height={size}
      draggable={false}
    />
  );
}
