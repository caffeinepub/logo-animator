import { useState, useCallback } from 'react';
import { generateLogoSpecification } from '../logo/generator';
import { renderStaticSvg } from '../logo/renderStaticSvg';
import { renderAnimatedSvg } from '../logo/renderAnimatedSvg';
import type { LogoSpecification } from '../backend';

export interface GeneratedLogo {
  specification: LogoSpecification;
  staticSvg: string;
  animatedSvg: string;
  wordmark: string;
}

export function useLogoGeneration() {
  const [generatedLogo, setGeneratedLogo] = useState<GeneratedLogo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDescription, setLastDescription] = useState<string>('');

  const generate = useCallback(async (description: string): Promise<GeneratedLogo | null> => {
    if (isGenerating) return null;

    setIsGenerating(true);
    setError(null);
    setLastDescription(description);

    try {
      // Simulate a brief delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const { specification, wordmark } = generateLogoSpecification(description);
      const staticSvg = renderStaticSvg(specification, wordmark);
      const animatedSvg = renderAnimatedSvg(specification, wordmark, 1);

      const result: GeneratedLogo = {
        specification,
        staticSvg,
        animatedSvg,
        wordmark
      };

      setGeneratedLogo(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate logo';
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const retry = useCallback(() => {
    if (lastDescription) {
      generate(lastDescription);
    }
  }, [lastDescription, generate]);

  return {
    generate,
    retry,
    generatedLogo,
    isGenerating,
    error
  };
}
