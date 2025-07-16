---
layout: post
title: Cardiac Ischemia Prediction
date: 2025-06-10
summary: >
  Comparative evaluation of shallow, deep, and residual‑enhanced multilayer perceptrons for classifying single‑lead ECG tracings as normal or ischemic.  
---  

# Problem Statement  
Acute Coronary Syndrome (ACS) demands rapid and accurate identification to improve patient outcomes. ECG interpretation remains a cornerstone of early ACS detection, but standard rule‑based algorithms and clinician review introduce delays and variability. We explore whether purely feed‑forward neural classifiers can reliably distinguish normal from ischemic single‑lead ECG cycles, with the aim of simplifying clinical workflows and reducing diagnostic latency.

# Previous Work  
- **2022 Literature Review:**
  - 59 ECG deep‑learning studies analyzed.
  - Convolutional networks (e.g., ResNet) achieved >97 % accuracy but struggle with noisy, single‑cycle data.

- **2023 Prospective Cohort Study:**
  - 12‑lead ECGs, 10 classical ML classifiers.
  - Random Forest achieved AUROC 0.91 (95 % CI 0.87–0.96), outperforming clinicians and commercial systems.

# Theoretical Approach
We hypothesize that architectural depth and residual connections can mitigate vanishing‑gradient issues in MLPs trained on time‑series ECG signals. By comparing:

1. **Shallow MLP (5 layers)**
2. **Deep MLP (22 layers)**
3. **Residual MLP (22 layers + skip connections + batch norm)**

we assess:
- **Representational capacity:** Can deeper nets capture subtle ischemic features?
- **Training stability:** Do residuals improve convergence on noisy data?
- **Generalization:** Which architecture transfers best across dataset scales and class imbalances?

# Purpose
To systematically evaluate MLP variants on single‑cycle ECG datasets of varying scale, determining trade‑offs between complexity, stability, and predictive performance for ischemia detection.

# Research Question
Can an MLP—shallow, deep, or residual‑enhanced—accurately discriminate ischemic from normal single‑lead ECG tracings?  

# Methods

## Data Sources
- **ECG200:** 200 one‑cycle tracings, normal vs. ischemic.  
- **ECG5000:** 5 000 one‑cycle tracings, normal vs. abnormal (binary and multiclass subsets).

> *Note: MIT‑BIH and 12‑lead “Full ECG” data were dropped due to poor convergence in pilot tests.*

## Pre‑processing
- Z‑score normalization per cycle  
- 80/20 stratified train/validation split  

## Architectures
1. **Shallow MLP (5 layers):**
   - Input → Dense(64) → Tanh → Dense(32) → Tanh → Sigmoid

2. **Deep MLP (22 layers):**
   - 9× [Dense(32) → Tanh] → Dense(16) → Sigmoid

3. **Residual MLP (22 layers + shortcuts):**
   - Blocks of [Dense(32) → Tanh → BatchNorm] with identity shortcuts and funnel‑shaped sizes

## Training & Tuning
- **Optimizer:** Adam (learning rates swept over {1e‑3, 1e‑4, 1e‑5})  
- **Hidden sizes:** {8, 16, 32, 64} via grid search  
- Early stopping (patience = 10 epochs)

## Initialization
Xavier uniform for weights; biases initialized to zero.

# Results

| Dataset     | Metric          | Shallow | Deep | Residual |
|-------------|-----------------|---------|------|----------|
| **ECG200**  | Accuracy        | 86 %    | 81 % | **91 %** |
| **ECG5000** | Binary Accuracy | 98 %    | 98 % | **98 %** |
| **ECG5000** | Multiclass Acc. | 92 %    | 95 % | **95 %** |

- **ECG200:** Residual MLP led (91 %), showing depth+shortcuts help on small/noisy samples.  
- **ECG5000:** All reached ∼98 % binary accuracy; deeper models improved multiclass by 3 %.

<div class="image-grid">
  <!-- ECG200 -->
  <figure>
    <img src="/assets/ecg200shallow.jpeg" alt="ECG200 Shallow">
    <figcaption><a href="/assets/ecg200shallow.jpeg" target="_blank">ECG200 Shallow</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg200shallowcm.jpeg" alt="ECG200 Shallow CM">
    <figcaption><a href="/assets/ecg200shallowcm.jpeg" target="_blank">Shallow CM</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg200deep.jpeg" alt="ECG200 Deep">
    <figcaption><a href="/assets/ecg200deep.jpeg" target="_blank">ECG200 Deep</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg200deepcm.jpeg" alt="ECG200 Deep CM">
    <figcaption><a href="/assets/ecg200deepcm.jpeg" target="_blank">Deep CM</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg200deepwithsr.jpeg" alt="ECG200 Deep + Skip">
    <figcaption><a href="/assets/ecg200deepwithsr.jpeg" target="_blank">Deep + Skip</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg200deepwithsrcm.jpeg" alt="ECG200 Deep + Skip CM">
    <figcaption><a href="/assets/ecg200deepwithsrcm.jpeg" target="_blank">Deep + Skip CM</a></figcaption>
  </figure>

  <!-- ECG5000 -->
  <figure>
    <img src="/assets/ecg5000mcshallow.jpeg" alt="ECG5000 Shallow">
    <figcaption><a href="/assets/ecg5000mcshallow.jpeg" target="_blank">ECG5000 Shallow</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg5000mcshallowcm.jpeg" alt="ECG5000 Shallow CM">
    <figcaption><a href="/assets/ecg5000mcshallowcm.jpeg" target="_blank">Shallow CM</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg5000mcdeep.jpeg" alt="ECG5000 Deep">
    <figcaption><a href="/assets/ecg5000mcdeep.jpeg" target="_blank">ECG5000 Deep</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg5000mcdeepcm.jpeg" alt="ECG5000 Deep CM">
    <figcaption><a href="/assets/ecg5000mcdeepcm.jpeg" target="_blank">Deep CM</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg5000mcdeepsr.jpeg" alt="ECG5000 Deep + Skip">
    <figcaption><a href="/assets/ecg5000mcdeepsr.jpeg" target="_blank">Deep + Skip</a></figcaption>
  </figure>
  <figure>
    <img src="/assets/ecg5000mcdeepsrcm.jpeg" alt="ECG5000 Deep + Skip CM">
    <figcaption><a href="/assets/ecg5000mcdeepsrcm.jpeg" target="_blank">Deep + Skip CM</a></figcaption>
  </figure>
</div>



# Conclusion
Residual connections significantly boost MLP performance on small, noisy ECG cycles. For large datasets, shallow networks suffice for binary tasks, but deep/residual models yield multiclass gains. Pure MLPs struggle with multi‑lead or long sequences, suggesting CNNs or Transformers for richer ECG representations.

# Future Work
- Evaluate CNNs and Transformers on single‑cycle and full‑lead ECGs  
- Incorporate RNNs or attention mechanisms for multi‑beat/continuous monitoring  
- Conduct prospective clinical validation against cardiologist readings  

# References
1. Al‑Zaiti et al., 2023. Machine learning for ECG diagnosis and risk stratification… _Nature Medicine_.  
2. Dau et al., 2019. The UCR Time Series Classification Archive. UCR.  
3. Goldberger et al., 2000. PhysioBank, PhysioToolkit, and PhysioNet. _Circulation_.  
4. Institute of Medicine, 2000. _To err is human: Building a safer health system_.  
5. Moody & Mark, 2001. The impact of the MIT‑BIH Arrhythmia Database. _IEEE EMBS Mag_.  
6. Xiong et al., 2022. Deep Learning for Detecting and Locating Myocardial Infarction… _Frontiers in Cardiovascular Medicine_.  

<a href="https://github.com/dmeverly/MLP-on-ECG" style="display: block; text-align:right;" target = "_blank">  Github Repo -> </a>  