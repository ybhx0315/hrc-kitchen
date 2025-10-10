import { Weekday } from '@prisma/client';
import prisma from '../lib/prisma';

export class MenuService {
  /**
   * Get current weekday as Prisma enum
   */
  private getCurrentWeekday(): Weekday | null {
    const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const weekdayMap: { [key: number]: Weekday } = {
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
    };

    return weekdayMap[day] || null;
  }

  /**
   * Get today's menu items (current weekday only)
   */
  async getTodaysMenu() {
    const weekday = this.getCurrentWeekday();

    if (!weekday) {
      return {
        items: [],
        message: 'Menu not available on weekends',
        weekday: null,
      };
    }

    const items = await prisma.menuItem.findMany({
      where: {
        weekdays: {
          has: weekday,
        },
        isActive: true,
      },
      include: {
        customizations: true,
        variationGroups: {
          where: {},
          include: {
            options: {
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return {
      items,
      weekday,
      message: items.length > 0 ? null : 'No menu items available for today',
    };
  }

  /**
   * Get full weekly menu (all weekdays) - Admin only
   */
  async getWeeklyMenu() {
    const items = await prisma.menuItem.findMany({
      where: {
        isActive: true,
      },
      include: {
        customizations: true,
        variationGroups: {
          include: {
            options: {
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by weekday - items can appear in multiple days
    const groupedByWeekday = {
      MONDAY: items.filter(item => item.weekdays.includes('MONDAY')),
      TUESDAY: items.filter(item => item.weekdays.includes('TUESDAY')),
      WEDNESDAY: items.filter(item => item.weekdays.includes('WEDNESDAY')),
      THURSDAY: items.filter(item => item.weekdays.includes('THURSDAY')),
      FRIDAY: items.filter(item => item.weekdays.includes('FRIDAY')),
    };

    return groupedByWeekday;
  }

  /**
   * Get menu item by ID with customizations and variations
   */
  async getMenuItem(itemId: string) {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        customizations: true,
        variationGroups: {
          include: {
            options: {
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return item;
  }
}

export default new MenuService();
