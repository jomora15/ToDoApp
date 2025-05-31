import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBadge, IonIcon, IonFab, IonFabButton, IonModal, IonButton,
  IonInput, IonTextarea, IonItemSliding, IonItemOptions, IonItemOption, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonItemDivider
} from '@ionic/angular/standalone';
import { Task } from 'src/models/task.model';
import { inject } from "@angular/core";
import { StorageService } from '../services/storage.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, addCircleOutline, trash, closeCircleOutline, informationCircleOutline } from 'ionicons/icons';


@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  imports: [IonItemDivider, IonItemOption, IonItemOptions, IonItemSliding, IonTextarea, IonInput, IonButton, IonModal, IonFabButton, IonFab, IonIcon,
    IonBadge, IonItem, IonLabel, IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonSelect, IonSelectOption, IonText, ReactiveFormsModule]
})
export class TasksPage {
  @ViewChild(IonModal) modal!: IonModal;

  private storageService = inject(StorageService);
  tasks: Task[] = [];
  task: Task = new Task();
  taskForm: FormGroup;
  keyTasksList = "tasksList";
  keyCategoriesList = "categoriesList";
  categories: any[] = [];

  constructor(private _formBuilder: FormBuilder) {
    addIcons({ checkmarkCircleOutline, addCircleOutline, trash, closeCircleOutline, informationCircleOutline });

    this.taskForm = _formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      description: ['', Validators.compose([Validators.maxLength(300)])],
      categoryId: ['']
    });
  }

  ionViewWillEnter() {
    this.tasks = this.storageService.getAllItems(this.keyTasksList);
    this.categories = this.storageService.getAllItems(this.keyCategoriesList);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
    this.taskForm.reset();
  }

  save() {
    console.log(this.taskForm.getRawValue());

    this.modal.dismiss(this.taskForm.getRawValue(), 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.task.name = event.detail.data?.name;
      this.task.description = event.detail.data?.description;
      this.task.categoryId = event.detail.data?.categoryId;

      this.storageService.setOneItem(this.task, this.keyTasksList);

      this.tasks = this.storageService.getAllItems(this.keyTasksList);

      this.taskForm.reset();
    }
  }

  markAsReady(id: number, slide: any) {
    let updateTasks = this.tasks.map(task => {
      if (task.id === id) {
        return { ...task, complete: !task.complete }
      }

      return task;
    });

    this.storageService.setManyItems(updateTasks, this.keyTasksList);

    slide.close();
    this.tasks = this.storageService.getAllItems(this.keyTasksList);
  }

  removeTask(id: number, slide: any) {
    this.tasks = this.tasks.filter(task => task.id !== id);

    this.storageService.setManyItems(this.tasks, this.keyTasksList);

    slide.close();
    this.tasks = this.storageService.getAllItems(this.keyTasksList);
  }

  searchByCategory(event: CustomEvent) {
    let categoryToSearch = event.detail.value;

    this.tasks = this.storageService.searchByCategoryId(categoryToSearch, this.keyTasksList);
  }

  cancelFilter() {
    this.tasks = this.storageService.getAllItems(this.keyTasksList);
  }
}
