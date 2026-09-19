import { useEffect, useMemo, useState } from "react";
import { MapView } from "./MapView";
import type { CommunityCard } from "@qahal/shared";
import type { EffectiveProfileSnapshot, MapVariant } from "../../app/types";
import { api, type CommunityPerson } from "../../lib/api";
import { MapFloatingControls } from "./components/MapFloatingControls";
import { MapPeoplePanel } from "./components/MapPeoplePanel";
import { MapPersonSheet } from "./components/MapPersonSheet";
import { MapNoPermissionOverlay } from "./components/MapNoPermissionOverlay";
import { MapBottomNav } from "./components/MapBottomNav";
import { MapCitySwitcher } from "./components/MapCitySwitcher";
import { useI18n } from "../../app/i18n";
import type { ThemeMode } from "../../app/theme";

interface MapScreenProps {
  themeMode: ThemeMode;
  variant: MapVariant;
  communities: CommunityCard[];
  effectiveProfile: EffectiveProfileSnapshot;
  onVariantChange: (variant: MapVariant) => void;
  onGoHome: () => void;
  onGoProfile: () => void;
  cityName?: string;
  initialCenter?: [number, number];
  onCityChange?: (city: {
    name: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export const MapScreen = ({
  themeMode,
  variant,
  effectiveProfile,
  onVariantChange,
  onGoHome,
  onGoProfile,
  cityName,
  initialCenter,
  onCityChange,
}: MapScreenProps) => {
  const { t } = useI18n();
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    initialCenter,
  );
  const [activeCityName, setActiveCityName] = useState(cityName);
  const [mapZoom, setMapZoom] = useState(12);
  const [recenterKey, setRecenterKey] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [people, setPeople] = useState<CommunityPerson[]>([]);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<CommunityPerson | null>(
    null,
  );
  const isStartingUser = effectiveProfile.emunahState === "starting";

  useEffect(() => {
    setMapCenter(initialCenter);
    if (initialCenter) {
      setMapZoom(12);
    }
  }, [initialCenter]);

  useEffect(() => {
    setActiveCityName(cityName);
  }, [cityName]);

  useEffect(() => {
    const hasCoords =
      typeof mapCenter?.[0] === "number" && typeof mapCenter?.[1] === "number";
    if (!activeCityName && !hasCoords) {
      setPeople([]);
      return;
    }

    api
      .getCommunityPeople({
        city: activeCityName,
        latitude: hasCoords ? mapCenter[0] : undefined,
        longitude: hasCoords ? mapCenter[1] : undefined,
      })
      .then((res) => {
        setPeople(Array.isArray(res.people) ? res.people : []);
      })
      .catch(() => {
        setPeople([]);
      });
  }, [activeCityName, mapCenter]);

  const sortedPeople = useMemo(() => {
    return [...people].sort((a, b) => {
      const aLeader = a.badges.some((badge) => badge.kind === "messenger")
        ? 1
        : 0;
      const bLeader = b.badges.some((badge) => badge.kind === "messenger")
        ? 1
        : 0;
      if (bLeader !== aLeader) {
        return bLeader - aLeader;
      }
      return a.name.localeCompare(b.name);
    });
  }, [people]);

  const goToCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationError(t.map.geolocationUnsupported);
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setMapZoom(17);
        setRecenterKey((prev) => prev + 1);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError(t.map.geolocationDenied);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const peoplePanelVisible = variant === "allowed" && peopleOpen;

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      style={{ background: "var(--theme-bg-solid)" }}
    >
      {/* Map fills the whole screen area under overlays */}
      <div className="absolute inset-0 z-0">
        <MapView
          themeMode={themeMode}
          initialCenter={initialCenter}
          selectedCityCenter={mapCenter}
          targetZoom={mapZoom}
          recenterKey={recenterKey}
        />
      </div>

      <MapFloatingControls
        visible={variant === "allowed"}
        peopleCount={sortedPeople.length}
        locating={locating}
        onTogglePeople={() => {
          setPeopleOpen((prev) => !prev);
          setSelectedPerson(null);
        }}
        onLocate={goToCurrentLocation}
        locationError={locationError}
      />

      <MapCitySwitcher
        visible={variant === "allowed"}
        cityName={activeCityName}
        userLocation={
          typeof mapCenter?.[0] === "number" &&
          typeof mapCenter?.[1] === "number"
            ? { latitude: mapCenter[0], longitude: mapCenter[1] }
            : undefined
        }
        onCitySelected={(city) => {
          setActiveCityName(city.city);
          setMapCenter([city.latitude, city.longitude]);
          setMapZoom(13);
          setRecenterKey((prev) => prev + 1);
          setLocationError(null);
          setPeopleOpen(false);
          setSelectedPerson(null);
          onCityChange?.({
            name: city.city,
            latitude: city.latitude,
            longitude: city.longitude,
          });
        }}
      />

      {isStartingUser ? (
        <div className="absolute left-3 right-3 top-[112px] z-30 rounded-2xl bg-brand-purple/12 px-4 py-3 text-sm text-brand-navy shadow-sm backdrop-blur">
          {t.home.startingNotice}
        </div>
      ) : null}

      {peoplePanelVisible ? (
        <button
          type="button"
          aria-label={t.map.closePeopleList}
          className="absolute inset-0 z-20"
          onClick={() => {
            setPeopleOpen(false);
            setSelectedPerson(null);
          }}
        />
      ) : null}

      <MapPeoplePanel
        visible={peoplePanelVisible}
        people={sortedPeople}
        onSelectPerson={(person) => {
          setSelectedPerson(person);
          setPeopleOpen(false);
        }}
      />

      <MapNoPermissionOverlay
        visible={variant === "no-permission"}
        onEnable={() => onVariantChange("allowed")}
      />

      <MapPersonSheet
        person={selectedPerson}
        canMessage={!isStartingUser}
        disabledLabel={t.map.contactBlocked}
        onClose={() => setSelectedPerson(null)}
        onMessage={onGoHome}
      />

      <MapBottomNav
        visible={variant === "allowed"}
        onGoHome={onGoHome}
        onTogglePeople={() => setPeopleOpen((prev) => !prev)}
        onGoProfile={onGoProfile}
      />
    </section>
  );
};
