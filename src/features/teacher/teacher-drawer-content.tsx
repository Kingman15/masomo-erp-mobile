import { BRAND_PRIMARY } from "@/constants/theme";
import {
  TEACHER_MENU,
  type TeacherMenuGroup,
} from "@/features/teacher/menu-config";
import { useAuthStore } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import type { DrawerContentComponentProps } from "expo-router/drawer";
import { DrawerContentScrollView } from "expo-router/drawer";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

function getInitials(label: string) {
  const words = label.trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word.charAt(0).toUpperCase()).join("");
}

function DrawerHero() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.name ?? user?.username ?? null;

  return (
    <View className="px-5 pt-4 pb-5 border-b border-gray-100">
      <Image
        source={require("@/assets/images/logo-landscape-primary.png")}
        style={{ width: 150, height: 40 }}
        contentFit="contain"
      />

      {displayName && (
        <View className="flex-row items-center gap-3 mt-5">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: `${BRAND_PRIMARY}1A` }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: BRAND_PRIMARY }}
            >
              {getInitials(displayName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-sm font-semibold text-black"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text className="text-xs text-gray-500">
              {user?.role.name ?? "Enseignant"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function AnimatedChevron({ open }: { open: boolean }) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { rotate: withTiming(open ? "90deg" : "0deg", { duration: 200 }) },
    ],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </Animated.View>
  );
}

export function TeacherDrawerContent(props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const group = TEACHER_MENU.find(
      (item): item is TeacherMenuGroup =>
        item.type === "group" &&
        item.children.some((child) => child.href === pathname),
    );
    if (group) {
      setOpenGroups((prev) =>
        prev[group.label] ? prev : { ...prev, [group.label]: true },
      );
    }
  }, [pathname]);

  const goTo = (href: string) => {
    router.push(href);
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerClassName="pb-2">
      <DrawerHero />
      <View className="py-2">
        {TEACHER_MENU.map((item) => {
          if (item.type === "link") {
            const active = pathname === item.href;
            return (
              <Animated.View
                key={item.href}
                layout={LinearTransition.duration(200)}
              >
                <Pressable
                  onPress={() => goTo(item.href)}
                  className={`flex-row items-center gap-3 mx-3 my-0.5 px-4 py-3 rounded-lg active:bg-gray-50 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={active ? "#000000" : "#374151"}
                  />
                  <Text
                    className={`text-base ${
                      active ? "font-semibold text-black" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          }

          const isOpen = openGroups[item.label] ?? false;
          const groupActive = item.children.some(
            (child) => child.href === pathname,
          );

          return (
            <Animated.View
              key={item.label}
              layout={LinearTransition.duration(200)}
            >
              <Pressable
                onPress={() =>
                  setOpenGroups((prev) => ({ ...prev, [item.label]: !isOpen }))
                }
                className={`flex-row items-center gap-3 mx-3 my-0.5 px-4 py-3 rounded-lg active:bg-gray-50 ${
                  groupActive && !isOpen ? "bg-gray-100" : ""
                }`}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={groupActive ? "#000000" : "#374151"}
                />
                <Text
                  className={`flex-1 text-base ${
                    groupActive ? "font-semibold text-black" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Text>
                <AnimatedChevron open={isOpen} />
              </Pressable>
              {isOpen && (
                <Animated.View
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(120)}
                  layout={LinearTransition.duration(200)}
                  className="ml-8 mr-3 mt-0.5 mb-1 pl-4 border-l-2 border-gray-200"
                >
                  {item.children.map((child) => {
                    const active = pathname === child.href;
                    return (
                      <Pressable
                        key={child.href}
                        onPress={() => goTo(child.href)}
                        className={`py-2.5 px-3 my-0.5 rounded-md active:bg-gray-50 ${
                          active ? "bg-gray-100" : ""
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            active
                              ? "font-semibold text-black"
                              : "text-gray-600"
                          }`}
                        >
                          {child.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}
