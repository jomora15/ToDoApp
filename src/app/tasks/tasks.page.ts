import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBadge, IonIcon, IonFab, IonFabButton, IonModal, IonButton,
  IonInput, IonTextarea, IonItemSliding, IonItemOptions, IonItemOption, IonItem, IonLabel, IonList, IonSelect,
  IonSelectOption, IonText, IonItemDivider, IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { Task } from 'src/models/task.model';
import { inject } from "@angular/core";
import { StorageService } from '../services/storage.service';
import { RemoteConfigService } from '../services/remote-config.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { OverlayEventDetail } from '@ionic/core/components';
import {
  checkmarkCircleOutline, addCircleOutline, trash, closeCircleOutline, informationCircleOutline,
  createOutline
} from 'ionicons/icons';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  imports: [IonInfiniteScrollContent, IonItemDivider, IonItemOption, IonItemOptions, IonItemSliding, IonTextarea, IonInput, IonButton, IonModal, IonFabButton, IonFab, IonIcon,
    IonBadge, IonItem, IonLabel, IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonSelect, IonSelectOption, IonText,
    ReactiveFormsModule, IonInfiniteScroll]
})
export class TasksPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  private storageService = inject(StorageService);
  private remoteConfigService = inject(RemoteConfigService);
  private remoteConfigSubscription: Subscription | undefined;
  private currentFilteredTasks: Task[] = [];
  private readonly tasksPerLoad = 20;
  public allTasksLoaded = false;

  tasks: Task[] = [];
  task: Task = new Task();
  allRawTasks: Task[] = [];
  taskForm: FormGroup;
  keyTasksList = "tasksList";
  keyCategoriesList = "categoriesList";
  categories: any[] = [];
  activeCategoryIdFilter: string | null = null;
  currentTaskIndex = 0;
  isNewFeatureEnabled: boolean = false;
  isModalOpen = false;

  constructor(private _formBuilder: FormBuilder) {
    addIcons({ checkmarkCircleOutline, addCircleOutline, trash, closeCircleOutline, informationCircleOutline, createOutline });

    this.taskForm = _formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      description: ['', Validators.compose([Validators.maxLength(300)])],
      categoryId: ['0']
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  ionViewWillEnter() {
    this.allRawTasks = this.storageService.getAllItems(this.keyTasksList);
    this.applyCurrentFilterAndResetPaging();

    if (this.remoteConfigSubscription) {
      this.remoteConfigSubscription.unsubscribe();
    }

    this.remoteConfigSubscription = this.remoteConfigService.getFeatureFlag('is_new_feature_enabled').subscribe(
      (isEnabled: boolean) => {
        this.isNewFeatureEnabled = isEnabled;
      },
      (error) => {
        this.isNewFeatureEnabled = false;
      }
    );

    this.loadCategories();
  }

  ngOnDestroy() {
    if (this.remoteConfigSubscription) {
      this.remoteConfigSubscription.unsubscribe();
      console.log('Suscripción a feature flag desuscrita.');
    }
  }

  cancel() {
    this.isModalOpen = false;
    this.taskForm.reset();
  }

  save() {
    const newTaskData = {
      ...this.taskForm.getRawValue(),
      id: this.getNextTaskId(),
      complete: false
    };

    this.storageService.setOneItem(newTaskData, this.keyTasksList);

    this.allRawTasks.push(newTaskData);
    this.applyCurrentFilterAndResetPaging(); // Re-aplica el filtro para mostrar la nueva tarea

    this.isModalOpen = false;
    this.taskForm.reset();
  }

  getNextTaskId(): number {
    const currentTasks = this.storageService.getAllItems(this.keyTasksList);

    if (currentTasks && currentTasks.length > 0) {
      return Math.max(...currentTasks.map(task => task.id || 0)) + 1;
    }
    return 1;
  }

  markAsReady(id: number, slide: any) {
    let taskToUpdate = this.allRawTasks.find(task => task.id === id);
    if (taskToUpdate) {
      taskToUpdate.complete = !taskToUpdate.complete;
      this.storageService.updateOneItem(taskToUpdate, this.keyTasksList);

      const indexInAllRawTasks = this.allRawTasks.findIndex(task => task.id === id);
      if (indexInAllRawTasks !== -1) {
        this.allRawTasks[indexInAllRawTasks] = taskToUpdate;
      }
      const indexInTasks = this.tasks.findIndex(task => task.id === id);
      if (indexInTasks !== -1) {
        this.tasks[indexInTasks] = taskToUpdate;
      }
    }
    slide.close();
  }

  removeTask(id: number, slide: any) {
    this.storageService.removeOneItemById(id, this.keyTasksList);

    this.allRawTasks = this.allRawTasks.filter(task => task.id !== id);
    this.applyCurrentFilterAndResetPaging();

    slide.close();
  }

  searchByCategory(event: CustomEvent) {
    const selectedValue = event.detail.value;
    this.activeCategoryIdFilter = selectedValue === '' || selectedValue === '0' ? null : String(selectedValue);
    this.applyCurrentFilterAndResetPaging();
  }

  cancelFilter() {
    this.activeCategoryIdFilter = null;
    this.applyCurrentFilterAndResetPaging();
  }

  loadMoreTasks(event?: any) {
    if (this.allTasksLoaded) {
      if (event) event.target.complete();
      return;
    }

    const newTasks = this.currentFilteredTasks.slice(this.currentTaskIndex, this.currentTaskIndex + this.tasksPerLoad);
    this.tasks = [...this.tasks, ...newTasks];

    this.currentTaskIndex += newTasks.length;

    if (newTasks.length < this.tasksPerLoad || this.currentTaskIndex >= this.currentFilteredTasks.length) {
      this.allTasksLoaded = true;
    }

    if (event) {
      event.target.complete();
      if (this.infiniteScroll) {
        this.infiniteScroll.disabled = this.allTasksLoaded;
      }
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  onWillDismiss(event: Event) {
    // Escucha el evento de cierre del modal para resetear el estado
    const ev = event as CustomEvent<OverlayEventDetail>;
    if (ev.detail.role === 'cancel') {
      this.taskForm.reset();
    }
    this.isModalOpen = false; // Cierra el modal
  }

  private applyCurrentFilterAndResetPaging() {
    if (this.activeCategoryIdFilter !== null && this.activeCategoryIdFilter !== '') {
      this.currentFilteredTasks = this.allRawTasks.filter(task => String(task.categoryId) === this.activeCategoryIdFilter);
    } else {
      this.currentFilteredTasks = [...this.allRawTasks];
    }

    this.currentTaskIndex = 0;
    this.allTasksLoaded = false;
    this.tasks = [];

    this.currentFilteredTasks.sort((a: Task, b: Task) => (a.id || 0) - (b.id || 0));

    this.loadMoreTasks();

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  private loadCategories(): void {
    this.categories = this.storageService.getAllItems(this.keyCategoriesList);
  }
}
