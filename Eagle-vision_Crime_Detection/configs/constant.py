from yacs.config import CfgNode

_C = CfgNode()

'''
The paths below should be modified to adapt your project

'''

############# 1. Model Paths #######################

## The pretrained model paths
_C.I3D_MODEL_PATH='../pretrained_models/model_rgb.pth'
_C.C3D_MODEL_PATH='../pretrained_models/C3D_Sport1M.pth'

## Trained Ckpts
_C.UCF_I3D_MODEL_PATH='../ckpts/UCF_I3D_AUC_0.8230.pth'

## Vis Paths
_C.TEST_SPATIAL_ANNOTATION_PATH='../data/Test_Spatial_Annotation.npy'
############ 2. UCF Data ###########################
_C.TRAIN_H5_PATH='data/testing_compression/UCFCrime-Frames-test.h5'
_C.TEST_H5_PATH=r"C:\Users\pavan\Downloads\Testing_Videos_UCF_H5\Abuse028_x264.h5"
_C.TESTING_TXT_PATH='../data/Temporal_Anomaly_Annotation_New.txt'

_C.PSEUDO_LABEL_PATH_I3D='../data/UCF_I3D_PLs.npy'
_C.PSEUDO_LABEL_PATH_C3D='../data/UCF_C3D_PLs.npy'


############# 4. Dataset Related ###################
_C.DATASET=CfgNode()
_C.DATASET.MEAN=[0.45,0.45,0.45]
_C.DATASET.STD=[0.225,0.225,0.225]

_C.DATASET.CROP_SIZE=224
_C.DATASET.RESIZE=256

_C.DATASET.C3D_MEAN=[90.25,97.66,101.41]
_C.DATASET.C3D_STD=[1,1,1]


############# 5.training setting ##################
_C.SEED=0
_C.LOG_DIR='../logs/'
_C.SUMMARY_DIR='../summarys/'
_C.MODEL_DIR='../train_ckpts/'
_C.VIS_DIR='../outputs/'

import os
def mkdir(path):
    if not os.path.exists(path):
        os.mkdir(path)

mkdir(_C.LOG_DIR)
mkdir(_C.SUMMARY_DIR)
mkdir(_C.MODEL_DIR)
mkdir(_C.VIS_DIR)
