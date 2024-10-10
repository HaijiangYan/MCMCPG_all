# Quickly recovering comprehensive individual mental representations of facial affect

### This repository contains 4 folders listed below, each severs as a component of this study:


1. To see how our facial affect VAE model was built, go to **facial-affect-vae**; 
    - Environment: 
        > Python 3.10; \
        > Pytorch 2.2.0; \
        > cuda 12.1;
    - Content: 
        > data: pre-processed California Facial Expression (cafe) database; \
        > models: model architechtures defined by torch, and the saved resnet-18 checkpoint that we used as the encoder of our VAE; \
        > Python scripts: load dataset, train&save models; \
        > main.ipynb: a step-by-step demo showing how the training works.

2. To see how to deploy a VAE model on an online server, go to **vae-deploy**;
    - Environment: 
        > Python 3.10; \
        > Pytorch 2.2.0; \
        > bentoml; \
        > pybase64;
    - Content: 
        > models: model architechtures used in deployment; \
        > model_deploy: trained weights of the models to be deployed; \
        > bentofile.yaml: basic configurations of the deployment; \
        > service.py: the endpoint interactive function that requests are called. 
    - More instructions for using bentoml, click [here](https://www.bentoml.com/). 

3. To see how the online Experiments were built and deployed, see **experiment-code**;
    1. **mcmcpg + add-on categorization task**: 
        - Environment: 
            > Dallinger 9.10.0;
        - Try locally:
            ```console
            # set up psql database as instructed in the documentation below
            root@server:~$ cd this_folder
            root@server:~$ dallinger debug
            ```
        - [User documentation of Dallinger](https://dallinger.readthedocs.io/latest/).
    2. **mapping**: the experiment in which participants rate images on valence & arousal to map the stimuli from the VAE latent space to the Psychological space.
        - Environment: 
            > NodeJS;
            > jsPsych;
        - Content: 
            > all stimuli are listed in images/gridsamples; \
            > expriment is controlled by index.js. 
        - Try locally:
            ```console
            // firstly add a .env file to update the DROPBOXACCESSTOKEN
            root@local:~$ cd this_folder
            root@local:~$ touch .env
            // example of .env: DROPBOXACCESSTOKEN=(get your token from your dropbox)
            root@local:~$ node index.js
            ```
            
    3. **rating**: the experiment in which participants rate images on emotional intensity.
        - Environment: 
            > NodeJS;
            > jsPsych;
        - Content: 
            > all stimuli are listed in images/pca, images/vae, images/mcmcpg; \
            > expriment is controlled by index.js. 
        - Try locally:
            ```console
            // firstly add a .env file to update the DROPBOXACCESSTOKEN
            root@local:~$ cd this_folder
            root@local:~$ touch .env
            // example of .env: DROPBOXACCESSTOKEN=(get your token from your dropbox)
            root@local:~$ node index.js
            ```

4. To get the raw collected data and see how analyses were performed, go to **result-analysis**;
    - raw_data: three sub-folders for the three experiments in the study:
        1. mcmcpg: two sub-folders for two rounds of the experiments. 
            > round-1: r1_data_Dec23; \
            > round-2: r2_data_Jan; \
            > the data is downloaded from Heroku serevr's psql database as ".dump" file:
            ```console
            // download
            root@local:~$ cd this_folder
            root@local:~$ heroku pg:backups:capture --app experiment-app-name
            root@local:~$ heroku pg:backups:download --app experiment-app-name
            // load the dump files in local psql database
            root@local:~$ createdb -O dallinger database_name
            root@local:~$ pg_restore --verbose --clean --no-acl --no-owner -h localhost -U dallinger -d database_name 
            ```
            > then the database can be viewed by using database visulization tool like postico 2, or using python. Example:
            ```python
            # open local psql server and request via python 
            import psycopg2
            from sqlalchemy import create_engine
            import pandas as pd

            try:
                engine = create_engine('postgresql://dallinger:dallinger@localhost:5432/database_name')
                table = """select * from info"""
                info = pd.read_sql_query(table,con=engine)
                table = """select * from node"""
                node = pd.read_sql_query(table,con=engine)
                table = """select * from network"""
                network = pd.read_sql_query(table,con=engine)
            finally:
                #closing database connection.
                if engine:
                    engine.dispose()
                    print("PostgreSQL connection is closed!")
            
            ```
            > mainly used tables in the database include:
            > * network: a table containing information of each Markov Chain or other type of trial-set. In dallinger, trials are regarded as nodes, organized in different network. Each row in the table refers to a chain or a collection where an individual participant made successive trials. id: the number of each network; type: type of the network (empty=categorization task, chain=MC Chain); role: what the network is used for (probe=categorization task, chain_[target]_p[participant]=the category target of the chain for which participant)
            ![info](data_example/network_example.png)
            > * node: a table containing information about each single trial. Nodes are attached to each network, as a way to organize trials in experiment. Details: the id of trials and the target emotion; network_id: which network the trial belongs to; participant_id: who did this trial.
            ![info](data_example/node_example.png)
            > * info: a table containing information about participants' choices attached to each node (trial). Each row means a stimulus showed to a participant in a trial, so there will be two rows belonging to a same node. Origin_id: the associated node; property1: true=picked, null=not picked; contents: image stimulus shown to participants; details: how many times the gatekeeper rejected proposal samples for a current state in MCMCP process. 
            ![info](data_example/info_example.png)

        2. MCMCP-mapping
            > Each csv file contains all ratings from an individual participant: arousal & valence & img_id
        3. MCMCP-rating
            > Each csv file contains all ratings from an individual participant: rating & img_id
    - analysis (all codes the support the analysis of the study, each jupyter notebook runs analysis in a specific aspect)
        1. pca_analysis.ipynb
            > analyze convergence of MCMCP
        2. vae_analysis.ipynb
            > analyze convergence of MCMCP-VAE
        3. mcmcpg_analysis.ipynb
            > analyze convergence of MCMCPG
        4. visualization.ipynb
            > visualization of the comparison among the three methods, in terms of the convergence speed and recovery quality.
        5. categorization_task.ipynb
            > using recovered representaions to predict people's choices in the add-on categorization task.
        6. R.ipynb
            > fitting student T distributions to the recovered representations using the R package "fitHeavyTail".
        7. Normal_curve.ipynb
            > making figure 1 in the manuscript
        8. utils.py
            > some useful functions used in the analysis, e.g., the $\hat{R}$'s calculation.

    - models (model architechtures used)
    - pca_model / vae_model (stimuli generation model used in MCMCPs)
    - savedmodel
        > model.pt: trained MLP mapping function from VAE latent space to valence & arousal space; \
        > official: the resnet-18 model pretrained on the FER2018 database, cite from [here](https://github.com/LetheSec/Fer2013-Facial-Emotion-Recognition-Pytorch). 
    - secondary-data / categorization_data: Some provisional data generated in the course of the analysis, which were saved here for ease of reuse. 
