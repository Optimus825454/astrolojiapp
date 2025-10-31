import {
  getPlanetIconId,
  getZodiacSymbol,
  getZodiacSign,
  translateSignName,
  calculatePosition,
  formatDegree,
  isRetrograde,
} from "../chartUtils";

describe("Chart Utilities", () => {
  describe("getPlanetIconId", () => {
    it("should return correct icon ID for each planet", () => {
      expect(getPlanetIconId("sun")).toBe("sun");
      expect(getPlanetIconId("moon")).toBe("moon");
      expect(getPlanetIconId("venus")).toBe("star");
      expect(getPlanetIconId("mars")).toBe("zap");
      expect(getPlanetIconId("mercury")).toBe("circle");
    });

    it("should return circle for unknown planets", () => {
      expect(getPlanetIconId("unknown")).toBe("circle");
      expect(getPlanetIconId("pluto")).toBe("zap");
    });

    it("should handle case insensitivity", () => {
      expect(getPlanetIconId("SUN")).toBe("sun");
      expect(getPlanetIconId("Venus")).toBe("star");
    });
  });

  describe("getZodiacSymbol", () => {
    it("should return correct symbols for all signs", () => {
      const symbols = [
        "♈",
        "♉",
        "♊",
        "♋",
        "♌",
        "♍",
        "♎",
        "♏",
        "♐",
        "♑",
        "♒",
        "♓",
      ];

      symbols.forEach((symbol, index) => {
        expect(getZodiacSymbol(index + 1)).toBe(symbol);
      });
    });

    it("should return question mark for invalid sign numbers", () => {
      expect(getZodiacSymbol(0)).toBe("?");
      expect(getZodiacSymbol(13)).toBe("?");
      expect(getZodiacSymbol(-1)).toBe("?");
    });
  });

  describe("getZodiacSign", () => {
    it("should return correct sign names in Turkish", () => {
      const signs = [
        "Koç",
        "Boğa",
        "İkizler",
        "Yengeç",
        "Aslan",
        "Başak",
        "Terazi",
        "Akrep",
        "Yay",
        "Oğlak",
        "Kova",
        "Balık",
      ];

      signs.forEach((sign, index) => {
        expect(getZodiacSign(index + 1)).toBe(sign);
      });
    });

    it('should return "Bilinmeyen" for invalid sign numbers', () => {
      expect(getZodiacSign(0)).toBe("Bilinmeyen");
      expect(getZodiacSign(13)).toBe("Bilinmeyen");
    });
  });

  describe("translateSignName", () => {
    it("should translate English sign names to Turkish", () => {
      expect(translateSignName("Aries")).toBe("Koç");
      expect(translateSignName("Taurus")).toBe("Boğa");
      expect(translateSignName("Gemini")).toBe("İkizler");
      expect(translateSignName("Cancer")).toBe("Yengeç");
      expect(translateSignName("Leo")).toBe("Aslan");
      expect(translateSignName("Virgo")).toBe("Başak");
      expect(translateSignName("Libra")).toBe("Terazi");
      expect(translateSignName("Scorpio")).toBe("Akrep");
      expect(translateSignName("Sagittarius")).toBe("Yay");
      expect(translateSignName("Capricorn")).toBe("Oğlak");
      expect(translateSignName("Aquarius")).toBe("Kova");
      expect(translateSignName("Pisces")).toBe("Balık");
    });

    it("should return original name if translation not found", () => {
      expect(translateSignName("Unknown")).toBe("Unknown");
      expect(translateSignName("Test")).toBe("Test");
    });
  });

  describe("calculatePosition", () => {
    it("should calculate position correctly with valid data", () => {
      const position = {
        degrees: 25,
        minutes: 30,
        seconds: 45,
        longitude: 25.5125,
      };

      const result = calculatePosition(position);

      expect(result.degree).toBe(25);
      expect(result.minute).toBe(30);
      expect(result.second).toBe(45);
      expect(result.longitude).toBe(25.5125);
    });

    it("should handle missing position data", () => {
      const result = calculatePosition(null);

      expect(result.degree).toBe(0);
      expect(result.minute).toBe(0);
      expect(result.second).toBe(0);
      expect(result.longitude).toBe(0);
    });

    it("should handle partial position data", () => {
      const position = {
        degrees: 30,
        longitude: 30.5,
      };

      const result = calculatePosition(position);

      expect(result.degree).toBe(30);
      expect(result.minute).toBe(0);
      expect(result.second).toBe(0);
      expect(result.longitude).toBe(30.5);
    });
  });

  describe("formatDegree", () => {
    it("should format position to degree string", () => {
      const position = {
        longitude: 25.5125,
      };

      expect(formatDegree(position)).toBe("25.5°");
    });

    it("should handle null position", () => {
      expect(formatDegree(null)).toBe("0.0°");
    });

    it("should handle missing longitude", () => {
      const position = {};
      expect(formatDegree(position)).toBe("0.0°");
    });
  });

  describe("isRetrograde", () => {
    it("should return true for retrograde planets", () => {
      expect(isRetrograde({ retrograde: true })).toBe(true);
      expect(isRetrograde({ retrograde: "R" })).toBe(true);
    });

    it("should return false for direct planets", () => {
      expect(isRetrograde({ retrograde: false })).toBe(false);
      expect(isRetrograde({ retrograde: "D" })).toBe(false);
      expect(isRetrograde({})).toBe(false);
    });

    it("should handle null or undefined planet", () => {
      expect(isRetrograde(null)).toBe(false);
      expect(isRetrograde(undefined)).toBe(false);
    });
  });
});
