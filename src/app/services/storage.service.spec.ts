import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let localStorageSpy: {
    getItem: jasmine.Spy;
    setItem: jasmine.Spy;
    removeItem: jasmine.Spy;
    clear: jasmine.Spy;
  };

  beforeEach(() => {
    localStorageSpy = {
      getItem: jasmine.createSpy('localStorage.getItem').and.returnValue(null),
      setItem: jasmine.createSpy('localStorage.setItem'),
      removeItem: jasmine.createSpy('localStorage.removeItem'),
      clear: jasmine.createSpy('localStorage.clear')
    };

    spyOn(localStorage, 'getItem').and.callFake(localStorageSpy.getItem);
    spyOn(localStorage, 'setItem').and.callFake(localStorageSpy.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(localStorageSpy.removeItem);
    spyOn(localStorage, 'clear').and.callFake(localStorageSpy.clear);

    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorageSpy.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setOneItem', () => {
    const key = 'testKey';
    const initialItems = [{ id: 1, name: 'Task 1' }];
    const newItem = { id: 2, name: 'Task 2' };

    it('should add a new item', () => {
      localStorageSpy.getItem.and.returnValue(JSON.stringify(initialItems));

      service.setOneItem(newItem, key);

      expect(localStorageSpy.setItem).toHaveBeenCalled();
    });
  });

  describe('setManyItems', () => {
    const key = 'testKey';
    const tasksToSet = [{ id: 1, name: 'Task A' }, { id: 2, name: 'Task B' }];

    it('should set multiple items', () => {
      service.setManyItems(tasksToSet, key);
      expect(localStorageSpy.setItem).toHaveBeenCalled();
    });
  });

  describe('getAllItems', () => {
    const key = 'testKey';
    const storedItems = [{ id: 1, name: 'Test task' }];

    it('should return parsed items if data exists', () => {
      localStorageSpy.getItem.and.returnValue(JSON.stringify(storedItems));

      const result = service.getAllItems(key);

      expect(result).toEqual(storedItems);
    });

    it('should return an empty array if no data exists', () => {
      localStorageSpy.getItem.and.returnValue(null);

      const result = service.getAllItems(key);

      expect(result).toEqual([]);
    });
  });

  describe('removeAllItems', () => {
    const key = 'testKey';

    it('should remove all items for a given key', () => {
      service.removeAllItems(key);
      expect(localStorageSpy.removeItem).toHaveBeenCalled();
    });
  });

  describe('updateOneItem', () => {
    const key = 'testKey';
    const initialTasks = [
      { id: 1, name: 'Old Name', complete: false, description: 'Desc 1', categoryId: '1' },
      { id: 2, name: 'Task 2', complete: false, description: 'Desc 2', categoryId: '2' }
    ];
    const itemToUpdate = { id: 1, name: 'New Name', complete: true, description: 'Updated Desc 1', categoryId: '1' };

    beforeEach(() => {
      localStorageSpy.getItem.and.returnValue(JSON.stringify(initialTasks));
    });

    it('should update an existing item and save the list', () => {
      service.updateOneItem(itemToUpdate, key);
      expect(localStorageSpy.setItem).toHaveBeenCalledTimes(1);
    });

    it('should not modify other items when updating', () => {
      const anotherTaskToUpdate = { id: 3, name: 'Non-existent', complete: false, description: '', categoryId: '' };
      service.updateOneItem(anotherTaskToUpdate, key);
      expect(localStorageSpy.setItem).toHaveBeenCalled();
    });
  });

  describe('searchByCategoryId', () => {
    const key = 'testKey';
    const tasks = [
      { id: 1, name: 'Task A', categoryId: '1' },
      { id: 2, name: 'Task B', categoryId: '2' },
      { id: 3, name: 'Task C', categoryId: '1' },
      { id: 4, name: 'Task D', categoryId: '0' }
    ];

    beforeEach(() => {
      localStorageSpy.getItem.and.returnValue(JSON.stringify(tasks));
    });

    it('should return tasks filtered by categoryId', () => {
      const result = service.searchByCategoryId('1', key);
      expect(result).toEqual([{ id: 1, name: 'Task A', categoryId: '1' }, { id: 3, name: 'Task C', categoryId: '1' }]);
    });

    it('should return all tasks if id is "0"', () => {
      const result = service.searchByCategoryId('0', key);
      expect(result).toEqual(tasks);
    });

    it('should return an empty array if no matching tasks are found', () => {
      const result = service.searchByCategoryId('99', key);
      expect(result).toEqual([]);
    });
  });

  describe('getPaginatedItems', () => {
    const key = 'testKey';
    const allItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
      { id: 4, name: 'Item 4' },
      { id: 5, name: 'Item 5' }
    ];

    beforeEach(() => {
      localStorageSpy.getItem.and.returnValue(JSON.stringify(allItems));
    });

    it('should return a slice of items based on startIndex and limit', () => {
      const result = service.getPaginatedItems(key, 1, 2);
      expect(result).toEqual([{ id: 2, name: 'Item 2' }, { id: 3, name: 'Item 3' }]);
    });

    it('should return remaining items if limit exceeds available items', () => {
      const result = service.getPaginatedItems(key, 3, 10);
      expect(result).toEqual([{ id: 4, name: 'Item 4' }, { id: 5, name: 'Item 5' }]);
    });

    it('should sort items by id before pagination', () => {
      const unsortedItems = [
        { id: 5, name: 'Item 5' },
        { id: 1, name: 'Item 1' },
        { id: 3, name: 'Item 3' }
      ];
      localStorageSpy.getItem.and.returnValue(JSON.stringify(unsortedItems));
      const result = service.getPaginatedItems(key, 0, 3);
      expect(result).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 3, name: 'Item 3' },
        { id: 5, name: 'Item 5' }
      ]);
    });
  });

  describe('removeOneItemById', () => {
    const key = 'testKey';
    const initialItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ];

    beforeEach(() => {
      localStorageSpy.getItem.and.returnValue(JSON.stringify(initialItems));
    });

    it('should remove the specified task by id and save the updated list', () => {
      service.removeOneItemById(2, key);
      const expectedItems = [{ id: 1, name: 'Item 1' }, { id: 3, name: 'Item 3' }];
      expect(localStorageSpy.setItem).toHaveBeenCalledWith(key, JSON.stringify(expectedItems));
    });

    it('should do nothing if the item id does not exist', () => {
      service.removeOneItemById(99, key);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith(key, JSON.stringify(initialItems));
    });
  });
});