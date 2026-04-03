import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/contexts/InventoryContext";
import { PLAN_LIMITS, PlanType } from "@/types";

export interface PlanCheck {
  allowed: boolean;
  reason?: string;
  upgradeTarget?: PlanType;
}

export function usePlan() {
  const { user } = useAuth();
  const { properties } = useInventory();

  const plan: PlanType = user?.plan ?? "starter";
  const limits = PLAN_LIMITS[plan];

  /** Peut créer un nouvel inventaire / logement ? */
  function canCreateInventory(): PlanCheck {
    if (properties.length < limits.maxProperties) {
      return { allowed: true };
    }
    if (plan === "starter") {
      return {
        allowed: false,
        reason: "Le plan Starter est limité à 1 logement. Passez au plan Pro pour en créer jusqu'à 5.",
        upgradeTarget: "pro",
      };
    }
    if (plan === "pro") {
      return {
        allowed: false,
        reason: "Le plan Pro est limité à 5 logements. Passez au plan Pro+ pour des logements illimités.",
        upgradeTarget: "pro_plus",
      };
    }
    return { allowed: true };
  }

  /** Peut accéder au PDF complet avec photos ? */
  function canAccessPDF(): PlanCheck {
    if (limits.pdfFull) return { allowed: true };
    return {
      allowed: false,
      reason: "Le PDF professionnel avec photos est réservé au plan Pro. Passez à Pro pour l'activer.",
      upgradeTarget: "pro",
    };
  }

  /** Peut ajouter des photos horodatées ? */
  function canAddPhotos(): PlanCheck {
    if (limits.photos) return { allowed: true };
    return {
      allowed: false,
      reason: "Les photos horodatées sont disponibles à partir du plan Pro.",
      upgradeTarget: "pro",
    };
  }

  /** Peut utiliser l'export avancé ? */
  function canUseAdvancedExport(): PlanCheck {
    if (limits.advancedExport) return { allowed: true };
    return {
      allowed: false,
      reason: "L'export avancé est réservé au plan Pro+.",
      upgradeTarget: "pro_plus",
    };
  }

  /** Peut utiliser la signature électronique ? */
  function canUseSignature(): PlanCheck {
    if (limits.electronicSignature) return { allowed: true };
    return {
      allowed: false,
      reason: "La signature électronique est disponible à partir du plan Pro.",
      upgradeTarget: "pro",
    };
  }

  return {
    plan,
    limits,
    canCreateInventory,
    canAccessPDF,
    canAddPhotos,
    canUseAdvancedExport,
    canUseSignature,
  };
}
