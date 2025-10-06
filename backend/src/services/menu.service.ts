import { PrismaClient, Weekday } from '@prisma/client';

const prisma = new PrismaClient();

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
        weekday,
        isActive: true,
      },
      include: {
        customizations: true,
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
      },
      orderBy: [
        { weekday: 'asc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by weekday
    const groupedByWeekday = {
      MONDAY: items.filter(item => item.weekday === 'MONDAY'),
      TUESDAY: items.filter(item => item.weekday === 'TUESDAY'),
      WEDNESDAY: items.filter(item => item.weekday === 'WEDNESDAY'),
      THURSDAY: items.filter(item => item.weekday === 'THURSDAY'),
      FRIDAY: items.filter(item => item.weekday === 'FRIDAY'),
    };

    return groupedByWeekday;
  }

  /**
   * Get menu item by ID with customizations
   */
  async getMenuItem(itemId: string) {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        customizations: true,
      },
    });

    return item;
  }
}

export default new MenuService();
