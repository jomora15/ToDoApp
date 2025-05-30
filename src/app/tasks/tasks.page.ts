import { Component, OnInit, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonBadge, IonIcon, IonFab, IonFabButton, IonModal, IonButton, IonInput, IonTextarea } from '@ionic/angular/standalone';
import { IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { Task } from 'src/models/task.model';
import { inject } from "@angular/core";
import { StorageService } from '../services/storage.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  imports: [IonTextarea, IonInput, IonButton, IonModal, IonFabButton, IonFab, IonIcon, IonBadge, IonItem, IonLabel, IonList,
    IonHeader, IonToolbar, IonTitle, IonContent, ReactiveFormsModule,],
})
export class TasksPage implements OnInit {
  constructor(private _formBuilder: FormBuilder) {
    addIcons({ checkmarkCircleOutline, addCircleOutline });

    this.taskForm = _formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      description: ['', Validators.compose([Validators.maxLength(300)])]
    });
  }
  @ViewChild(IonModal) modal!: IonModal;

  private storageService = inject(StorageService);
  tasks: Task[] = [];
  task: Task = new Task();
  taskForm: FormGroup;

  ngOnInit(): void {
    this.tasks = this.storageService.getItems();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
    this.taskForm.reset();
  }

  save() {
    this.modal.dismiss(this.taskForm.getRawValue(), 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.task.name = event.detail.data?.name;
      this.task.description = event.detail.data?.description;

      this.storageService.setItems(this.task);

      this.tasks = this.storageService.getItems();

      this.taskForm.reset();
    }
  }
}
